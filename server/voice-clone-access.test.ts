import { describe, it, expect } from "vitest";

/**
 * Tests for Voice Cloning Access Control Logic
 * Voice cloning should be accessible to:
 * 1. VIP tier subscribers
 * 2. Users enrolled in the AI video course (courseId: 30001 or category: digital_teacher_ai)
 */

// Simulate the access control logic from UltimateStudio
function canUseVoiceClone(
  permissions: { tier: string } | null,
  enrollments: Array<{ enrollment: { courseId: number; status: string }; course: { category: string } | null }> | null
): boolean {
  const isVIP = permissions?.tier === "vip";
  const isVideoCourseMember = enrollments?.some((e) =>
    (e.enrollment?.courseId === 30001 || e.course?.category === "digital_teacher_ai") &&
    ["approved", "active", "completed"].includes(e.enrollment?.status)
  ) ?? false;
  return isVIP || isVideoCourseMember;
}

describe("Voice Cloning Access Control", () => {
  describe("VIP users", () => {
    it("should allow VIP users to use voice cloning", () => {
      expect(canUseVoiceClone({ tier: "vip" }, [])).toBe(true);
    });

    it("should allow VIP users even without enrollments", () => {
      expect(canUseVoiceClone({ tier: "vip" }, null)).toBe(true);
    });
  });

  describe("Non-VIP users without AI video course enrollment", () => {
    it("should deny free tier users", () => {
      expect(canUseVoiceClone({ tier: "free" }, [])).toBe(false);
    });

    it("should deny pro tier users without course enrollment", () => {
      expect(canUseVoiceClone({ tier: "pro" }, [])).toBe(false);
    });

    it("should deny users with no permissions", () => {
      expect(canUseVoiceClone(null, [])).toBe(false);
    });

    it("should deny users enrolled in other courses only", () => {
      expect(canUseVoiceClone({ tier: "free" }, [
        { enrollment: { courseId: 7, status: "approved" }, course: { category: "primary_teachers" } }
      ])).toBe(false);
    });
  });

  describe("AI Video Course participants", () => {
    it("should allow users enrolled in course ID 30001 with approved status", () => {
      expect(canUseVoiceClone({ tier: "free" }, [
        { enrollment: { courseId: 30001, status: "approved" }, course: { category: "primary_teachers" } }
      ])).toBe(true);
    });

    it("should allow users enrolled in course ID 30001 with active status", () => {
      expect(canUseVoiceClone({ tier: "free" }, [
        { enrollment: { courseId: 30001, status: "active" }, course: { category: "primary_teachers" } }
      ])).toBe(true);
    });

    it("should allow users enrolled in course ID 30001 with completed status", () => {
      expect(canUseVoiceClone({ tier: "free" }, [
        { enrollment: { courseId: 30001, status: "completed" }, course: { category: "primary_teachers" } }
      ])).toBe(true);
    });

    it("should allow users enrolled in any digital_teacher_ai category course", () => {
      expect(canUseVoiceClone({ tier: "free" }, [
        { enrollment: { courseId: 7, status: "approved" }, course: { category: "digital_teacher_ai" } }
      ])).toBe(true);
    });

    it("should deny users with pending enrollment in AI video course", () => {
      expect(canUseVoiceClone({ tier: "free" }, [
        { enrollment: { courseId: 30001, status: "pending" }, course: { category: "primary_teachers" } }
      ])).toBe(false);
    });

    it("should deny users with rejected enrollment in AI video course", () => {
      expect(canUseVoiceClone({ tier: "free" }, [
        { enrollment: { courseId: 30001, status: "rejected" }, course: { category: "primary_teachers" } }
      ])).toBe(false);
    });

    it("should deny users with cancelled enrollment in AI video course", () => {
      expect(canUseVoiceClone({ tier: "free" }, [
        { enrollment: { courseId: 30001, status: "cancelled" }, course: { category: "primary_teachers" } }
      ])).toBe(false);
    });
  });

  describe("Combined scenarios", () => {
    it("should allow VIP user who is also enrolled in AI video course", () => {
      expect(canUseVoiceClone({ tier: "vip" }, [
        { enrollment: { courseId: 30001, status: "approved" }, course: { category: "primary_teachers" } }
      ])).toBe(true);
    });

    it("should allow pro user enrolled in AI video course", () => {
      expect(canUseVoiceClone({ tier: "pro" }, [
        { enrollment: { courseId: 30001, status: "active" }, course: { category: "primary_teachers" } }
      ])).toBe(true);
    });

    it("should allow user with multiple enrollments including AI video course", () => {
      expect(canUseVoiceClone({ tier: "free" }, [
        { enrollment: { courseId: 1, status: "approved" }, course: { category: "primary_teachers" } },
        { enrollment: { courseId: 30001, status: "approved" }, course: { category: "primary_teachers" } },
        { enrollment: { courseId: 5, status: "completed" }, course: { category: "science_teachers" } }
      ])).toBe(true);
    });
  });
});
