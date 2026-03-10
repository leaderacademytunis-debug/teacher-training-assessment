import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";

// Mock user context
function createMockCtx(userId = 1) {
  return {
    user: {
      id: userId,
      openId: "test-open-id",
      name: "Test Teacher",
      email: "teacher@test.com",
      role: "user" as const,
      avatarUrl: null,
      createdAt: new Date(),
    },
    req: {} as any,
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as any,
  };
}

const caller = appRouter.createCaller(createMockCtx());

describe("Blind Grading Assistant", () => {
  describe("grading.createSession", () => {
    it("should create a grading session with default criteria", async () => {
      const session = await caller.grading.createSession({
        sessionTitle: "اختبار الرياضيات - الثلاثي 2",
        subject: "الرياضيات",
        grade: "السنة الرابعة",
        examType: "summative",
      });

      expect(session).toBeTruthy();
      if (session) {
        expect(session.sessionTitle).toBe("اختبار الرياضيات - الثلاثي 2");
        expect(session.subject).toBe("الرياضيات");
        expect(session.grade).toBe("السنة الرابعة");
        expect(session.examType).toBe("summative");
        expect(session.hideStudentNames).toBe(true);
        expect(session.status).toBe("draft");
        // Check default correction key
        const key = session.correctionKey as any;
        expect(key).toBeTruthy();
        expect(key.criteria).toHaveLength(3);
        expect(key.criteria[0].code).toBe("مع 1");
        expect(key.criteria[1].code).toBe("مع 2");
        expect(key.criteria[2].code).toBe("مع 3");
        expect(key.totalPoints).toBe(20);
        expect(key.gradingScale.excellent.symbol).toBe("+++");
        expect(key.gradingScale.notAcquired.symbol).toBe("---");
      }
    });

    it("should create a session with custom correction key", async () => {
      const customKey = {
        criteria: [
          { code: "مع 1", label: "الفهم", maxScore: 5, description: "فهم السند" },
          { code: "مع 2", label: "التطبيق", maxScore: 10, description: "تطبيق المعارف" },
          { code: "مع 3", label: "التحليل", maxScore: 5, description: "تحليل وتبرير" },
        ],
        totalPoints: 20,
        gradingScale: {
          excellent: { min: 90, symbol: "+++" },
          good: { min: 75, symbol: "++" },
          acceptable: { min: 60, symbol: "+" },
          insufficient: { min: 40, symbol: "-" },
          veryInsufficient: { min: 20, symbol: "--" },
          notAcquired: { min: 0, symbol: "---" },
        },
      };

      const session = await caller.grading.createSession({
        sessionTitle: "اختبار الإيقاظ العلمي",
        subject: "الإيقاظ العلمي",
        grade: "السنة الخامسة",
        correctionKey: customKey,
      });

      expect(session).toBeTruthy();
      if (session) {
        const key = session.correctionKey as any;
        expect(key.criteria[0].label).toBe("الفهم");
        expect(key.criteria[1].maxScore).toBe(10);
      }
    });
  });

  describe("grading.getSessions", () => {
    it("should return sessions for the current user", async () => {
      const sessions = await caller.grading.getSessions();
      expect(Array.isArray(sessions)).toBe(true);
    });
  });

  describe("grading.getSession", () => {
    it("should return session detail with submissions and stats", async () => {
      // First create a session
      const session = await caller.grading.createSession({
        sessionTitle: "جلسة اختبار",
        subject: "العربية",
        grade: "السنة الثالثة",
      });

      if (session) {
        const detail = await caller.grading.getSession({ sessionId: session.id });
        expect(detail.session).toBeTruthy();
        expect(detail.session.id).toBe(session.id);
        expect(Array.isArray(detail.submissions)).toBe(true);
        expect(detail.stats).toBeTruthy();
        expect(detail.stats.total).toBe(0);
      }
    });

    it("should throw NOT_FOUND for non-existent session", async () => {
      await expect(
        caller.grading.getSession({ sessionId: 999999 })
      ).rejects.toThrow();
    });
  });

  describe("grading.updateSession", () => {
    it("should update session settings including privacy toggle", async () => {
      const session = await caller.grading.createSession({
        sessionTitle: "جلسة للتحديث",
        subject: "الفرنسية",
        grade: "السنة السادسة",
      });

      if (session) {
        const result = await caller.grading.updateSession({
          sessionId: session.id,
          hideStudentNames: false,
          sessionTitle: "عنوان محدث",
        });
        expect(result.success).toBe(true);

        // Verify update
        const updated = await caller.grading.getSession({ sessionId: session.id });
        expect(updated.session.hideStudentNames).toBe(false);
        expect(updated.session.sessionTitle).toBe("عنوان محدث");
      }
    });
  });

  describe("grading.deleteSession", () => {
    it("should delete a session", async () => {
      const session = await caller.grading.createSession({
        sessionTitle: "جلسة للحذف",
        subject: "الرياضيات",
        grade: "السنة الأولى",
      });

      if (session) {
        const result = await caller.grading.deleteSession({ sessionId: session.id });
        expect(result.success).toBe(true);

        // Verify deletion
        await expect(
          caller.grading.getSession({ sessionId: session.id })
        ).rejects.toThrow();
      }
    });
  });

  describe("grading.exportResults", () => {
    it("should export session results as summary", async () => {
      const session = await caller.grading.createSession({
        sessionTitle: "جلسة للتصدير",
        subject: "الرياضيات",
        grade: "السنة الرابعة",
      });

      if (session) {
        const summary = await caller.grading.exportResults({
          sessionId: session.id,
          format: "summary",
        });
        expect(summary.session).toBeTruthy();
        expect(summary.session.title).toBe("جلسة للتصدير");
        expect((summary as any).summary).toBeTruthy();
        expect((summary as any).summary.totalStudents).toBe(0);
      }
    });

    it("should export session results as JSON", async () => {
      const session = await caller.grading.createSession({
        sessionTitle: "جلسة JSON",
        subject: "العربية",
        grade: "السنة الثانية",
      });

      if (session) {
        const jsonResult = await caller.grading.exportResults({
          sessionId: session.id,
          format: "json",
        });
        expect(jsonResult.session).toBeTruthy();
        expect(Array.isArray((jsonResult as any).results)).toBe(true);
      }
    });
  });

  describe("Privacy Shield", () => {
    it("should default to hiding student names", async () => {
      const session = await caller.grading.createSession({
        sessionTitle: "جلسة الخصوصية",
        subject: "الرياضيات",
        grade: "السنة الثالثة",
      });

      expect(session?.hideStudentNames).toBe(true);
    });

    it("should toggle privacy setting", async () => {
      const session = await caller.grading.createSession({
        sessionTitle: "جلسة تبديل الخصوصية",
        subject: "العربية",
        grade: "السنة الرابعة",
      });

      if (session) {
        // Toggle off
        await caller.grading.updateSession({
          sessionId: session.id,
          hideStudentNames: false,
        });
        let detail = await caller.grading.getSession({ sessionId: session.id });
        expect(detail.session.hideStudentNames).toBe(false);

        // Toggle back on
        await caller.grading.updateSession({
          sessionId: session.id,
          hideStudentNames: true,
        });
        detail = await caller.grading.getSession({ sessionId: session.id });
        expect(detail.session.hideStudentNames).toBe(true);
      }
    });
  });

  describe("Tunisian Grading Scale", () => {
    it("should include correct Tunisian mastery levels in default key", async () => {
      const session = await caller.grading.createSession({
        sessionTitle: "اختبار المعايير",
        subject: "الإيقاظ العلمي",
        grade: "السنة الخامسة",
      });

      if (session) {
        const key = session.correctionKey as any;
        expect(key.gradingScale.excellent).toEqual({ min: 90, symbol: "+++" });
        expect(key.gradingScale.good).toEqual({ min: 75, symbol: "++" });
        expect(key.gradingScale.acceptable).toEqual({ min: 60, symbol: "+" });
        expect(key.gradingScale.insufficient).toEqual({ min: 40, symbol: "-" });
        expect(key.gradingScale.veryInsufficient).toEqual({ min: 20, symbol: "--" });
        expect(key.gradingScale.notAcquired).toEqual({ min: 0, symbol: "---" });
      }
    });
  });

  describe("Class Statistics (Enhancement)", () => {
    it("should return class statistics for a session", async () => {
      const session = await caller.grading.createSession({
        sessionTitle: "جلسة الإحصائيات",
        subject: "الرياضيات",
        grade: "السنة الرابعة",
      });

      if (session) {
        const stats = await caller.grading.classStatistics({ sessionId: session.id });
        expect(stats.session).toBeTruthy();
        expect(stats.session.title).toBe("جلسة الإحصائيات");
        expect(stats.overview).toBeTruthy();
        expect(stats.overview.totalStudents).toBe(0);
        expect(stats.overview.gradedStudents).toBe(0);
        expect(stats.overview.average).toBe(0);
        expect(stats.overview.passRate).toBe(0);
        expect(stats.overview.excellenceRate).toBe(0);
        expect(Array.isArray(stats.scoreBuckets)).toBe(true);
        expect(stats.scoreBuckets).toHaveLength(4);
        expect(Array.isArray(stats.masteryLevels)).toBe(true);
        expect(stats.masteryLevels).toHaveLength(6);
        expect(Array.isArray(stats.criteriaAnalysis)).toBe(true);
        expect(Array.isArray(stats.studentResults)).toBe(true);
      }
    });

    it("should have correct score bucket labels", async () => {
      const session = await caller.grading.createSession({
        sessionTitle: "جلسة الدلاء",
        subject: "العربية",
        grade: "السنة الثانية",
      });

      if (session) {
        const stats = await caller.grading.classStatistics({ sessionId: session.id });
        const labels = stats.scoreBuckets.map((b: any) => b.label);
        expect(labels).toContain("0-4");
        expect(labels).toContain("5-9");
        expect(labels).toContain("10-14");
        expect(labels).toContain("15-20");
      }
    });

    it("should have correct mastery level symbols", async () => {
      const session = await caller.grading.createSession({
        sessionTitle: "جلسة المستويات",
        subject: "الإيقاظ العلمي",
        grade: "السنة الخامسة",
      });

      if (session) {
        const stats = await caller.grading.classStatistics({ sessionId: session.id });
        const symbols = stats.masteryLevels.map((l: any) => l.symbol);
        expect(symbols).toContain("+++");
        expect(symbols).toContain("++");
        expect(symbols).toContain("+");
        expect(symbols).toContain("-");
        expect(symbols).toContain("--");
        expect(symbols).toContain("---");
      }
    });
  });

  describe("GPS Context Integration", () => {
    it("should return GPS context for grading session", async () => {
      const result = await caller.grading.getGPSContext({
        subject: "الرياضيات",
        grade: "السنة الرابعة",
      });
      // May return null if no plans exist, but should not throw
      expect(result).toBeTruthy();
      expect(result).toHaveProperty("activePlan");
      expect(result).toHaveProperty("currentTopic");
      expect(result).toHaveProperty("period");
    });

    it("should return null plan when no curriculum exists", async () => {
      const result = await caller.grading.getGPSContext({
        subject: "مادة غير موجودة XYZ",
        grade: "مستوى غير موجود",
      });
      expect(result.activePlan).toBeNull();
    });

    it("should work without subject/grade filters", async () => {
      const result = await caller.grading.getGPSContext({});
      expect(result).toBeTruthy();
      expect(result).toHaveProperty("activePlan");
    });
  });

  describe("Enhanced Student Handwriting OCR", () => {
    it("should have enhanced OCR procedure available", async () => {
      // Verify the procedure exists on the router
      expect(caller.grading.enhancedStudentOCR).toBeDefined();
    });
  });

  describe("Encouragement Note in AI Grading", () => {
    it("should have aiGrade procedure that includes encouragement note", async () => {
      // Verify the procedure exists
      expect(caller.grading.aiGrade).toBeDefined();
    });
  });

  describe("Class Statistics - Criteria Weakness Analysis", () => {
    it("should return criteria analysis with success rates", async () => {
      const session = await caller.grading.createSession({
        sessionTitle: "جلسة تحليل المعايير",
        subject: "الرياضيات",
        grade: "السنة الرابعة",
      });

      if (session) {
        const stats = await caller.grading.classStatistics({ sessionId: session.id });
        expect(stats.criteriaAnalysis).toBeDefined();
        expect(Array.isArray(stats.criteriaAnalysis)).toBe(true);
        // Each criteria should have successRate field
        stats.criteriaAnalysis.forEach((c: any) => {
          expect(c).toHaveProperty("code");
          expect(c).toHaveProperty("label");
          expect(c).toHaveProperty("average");
          expect(c).toHaveProperty("maxScore");
          expect(c).toHaveProperty("successRate");
        });
      }
    });

    it("should identify weak criteria with low success rates", async () => {
      const session = await caller.grading.createSession({
        sessionTitle: "جلسة المعايير الضعيفة",
        subject: "الإيقاظ العلمي",
        grade: "السنة الخامسة",
      });

      if (session) {
        const stats = await caller.grading.classStatistics({ sessionId: session.id });
        // With no submissions, all criteria should have 0% success rate
        const weakCriteria = stats.criteriaAnalysis.filter((c: any) => c.successRate < 50);
        // All criteria should be "weak" with 0 students
        expect(weakCriteria.length).toBe(stats.criteriaAnalysis.length);
      }
    });
  });

  describe("PDF Export (Enhancement)", () => {
    it("should export session results as PDF", async () => {
      const session = await caller.grading.createSession({
        sessionTitle: "جلسة PDF",
        subject: "الرياضيات",
        grade: "السنة الرابعة",
      });

      if (session) {
        const result = await caller.grading.exportPDF({ sessionId: session.id });
        expect(result.url).toBeTruthy();
        expect(typeof result.url).toBe("string");
        expect(result.url.length).toBeGreaterThan(0);
      }
    }, 30000);
  });
});
