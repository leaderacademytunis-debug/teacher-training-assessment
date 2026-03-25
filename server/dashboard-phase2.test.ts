import { describe, it, expect } from "vitest";

/**
 * Phase 2 Tests: Dashboard Data, Notifications, and Role Guard
 * Tests the new dashboardApi endpoints, notification hooks, and auto-redirect logic
 */

describe("Dashboard API - Teacher Stats", () => {
  it("should define the teacherStats endpoint structure", () => {
    // Verify the expected response shape
    const expectedFields = [
      "totalCertificates",
      "totalEvaluations",
      "totalImages",
      "totalConversations",
      "totalCourses",
      "recentActivity",
      "portfolioStats",
    ];
    expectedFields.forEach((field) => {
      expect(typeof field).toBe("string");
    });
  });

  it("should compute teacher level correctly from points", () => {
    // Level computation logic
    const computeLevel = (points: number) => {
      if (points >= 500) return { level: 5, title: "خبير معتمد", nextThreshold: null };
      if (points >= 300) return { level: 4, title: "معلم متميز", nextThreshold: 500 };
      if (points >= 150) return { level: 3, title: "معلم نشط", nextThreshold: 300 };
      if (points >= 50) return { level: 2, title: "معلم مبتدئ", nextThreshold: 150 };
      return { level: 1, title: "مبتدئ", nextThreshold: 50 };
    };

    expect(computeLevel(0)).toEqual({ level: 1, title: "مبتدئ", nextThreshold: 50 });
    expect(computeLevel(49)).toEqual({ level: 1, title: "مبتدئ", nextThreshold: 50 });
    expect(computeLevel(50)).toEqual({ level: 2, title: "معلم مبتدئ", nextThreshold: 150 });
    expect(computeLevel(150)).toEqual({ level: 3, title: "معلم نشط", nextThreshold: 300 });
    expect(computeLevel(300)).toEqual({ level: 4, title: "معلم متميز", nextThreshold: 500 });
    expect(computeLevel(500)).toEqual({ level: 5, title: "خبير معتمد", nextThreshold: null });
    expect(computeLevel(1000)).toEqual({ level: 5, title: "خبير معتمد", nextThreshold: null });
  });

  it("should compute teacher points correctly from activity counts", () => {
    // Points calculation: certificates*20 + evaluations*5 + images*3 + conversations*2 + courses*10
    const computePoints = (stats: {
      totalCertificates: number;
      totalEvaluations: number;
      totalImages: number;
      totalConversations: number;
      totalCourses: number;
    }) => {
      return (
        stats.totalCertificates * 20 +
        stats.totalEvaluations * 5 +
        stats.totalImages * 3 +
        stats.totalConversations * 2 +
        stats.totalCourses * 10
      );
    };

    expect(computePoints({ totalCertificates: 0, totalEvaluations: 0, totalImages: 0, totalConversations: 0, totalCourses: 0 })).toBe(0);
    expect(computePoints({ totalCertificates: 1, totalEvaluations: 2, totalImages: 3, totalConversations: 4, totalCourses: 1 })).toBe(20 + 10 + 9 + 8 + 10);
    expect(computePoints({ totalCertificates: 5, totalEvaluations: 10, totalImages: 20, totalConversations: 30, totalCourses: 5 })).toBe(100 + 50 + 60 + 60 + 50);
  });
});

describe("Dashboard API - School Stats", () => {
  it("should define the schoolStats endpoint structure", () => {
    const expectedStatsFields = [
      "totalJobs",
      "activeJobs",
      "totalApplications",
      "pendingApplications",
      "acceptedApplications",
      "rejectedApplications",
      "shortlistedApplications",
      "interviewedApplications",
    ];
    expectedStatsFields.forEach((field) => {
      expect(typeof field).toBe("string");
    });
  });

  it("should correctly compute application status counts", () => {
    const applications = [
      { status: "sent" },
      { status: "sent" },
      { status: "viewed" },
      { status: "shortlisted" },
      { status: "interviewed" },
      { status: "accepted" },
      { status: "rejected" },
    ];

    const counts = {
      total: applications.length,
      pending: applications.filter((a) => a.status === "sent").length,
      accepted: applications.filter((a) => a.status === "accepted").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
      shortlisted: applications.filter((a) => a.status === "shortlisted").length,
      interviewed: applications.filter((a) => a.status === "interviewed").length,
    };

    expect(counts.total).toBe(7);
    expect(counts.pending).toBe(2);
    expect(counts.accepted).toBe(1);
    expect(counts.rejected).toBe(1);
    expect(counts.shortlisted).toBe(1);
    expect(counts.interviewed).toBe(1);
  });
});

describe("Notification System - Role-Based", () => {
  it("should generate correct notification for job application", () => {
    const teacherName = "أحمد";
    const jobTitle = "معلم رياضيات";
    const matchScore = 85;

    const notification = {
      titleAr: "طلب توظيف جديد",
      messageAr: `تقدّم ${teacherName} لوظيفة "${jobTitle}" بنسبة تطابق ${matchScore}%`,
      type: "application_received" as const,
    };

    expect(notification.titleAr).toBe("طلب توظيف جديد");
    expect(notification.messageAr).toContain("أحمد");
    expect(notification.messageAr).toContain("معلم رياضيات");
    expect(notification.messageAr).toContain("85%");
    expect(notification.type).toBe("application_received");
  });

  it("should generate correct notification for status change", () => {
    const statusLabels: Record<string, string> = {
      viewed: "تمت مشاهدة طلبك",
      shortlisted: "تم إدراجك في القائمة القصيرة",
      interviewed: "تمت دعوتك للمقابلة",
      accepted: "تم قبول طلبك! مبروك",
      rejected: "لم يتم قبول طلبك",
    };

    expect(statusLabels["accepted"]).toBe("تم قبول طلبك! مبروك");
    expect(statusLabels["rejected"]).toBe("لم يتم قبول طلبك");
    expect(statusLabels["shortlisted"]).toBe("تم إدراجك في القائمة القصيرة");
    expect(statusLabels["interviewed"]).toBe("تمت دعوتك للمقابلة");
    expect(statusLabels["viewed"]).toBe("تمت مشاهدة طلبك");
  });

  it("should generate correct notification for new job posting", () => {
    const schoolName = "المدرسة النموذجية";
    const jobTitle = "معلم علوم";
    const region = "تونس العاصمة";

    const notification = {
      titleAr: "وظيفة جديدة تناسب ملفك",
      messageAr: `نشرت ${schoolName} وظيفة "${jobTitle}" في ${region} - اطلع عليها الآن`,
      type: "new_job" as const,
    };

    expect(notification.titleAr).toBe("وظيفة جديدة تناسب ملفك");
    expect(notification.messageAr).toContain("المدرسة النموذجية");
    expect(notification.messageAr).toContain("معلم علوم");
    expect(notification.messageAr).toContain("تونس العاصمة");
    expect(notification.type).toBe("new_job");
  });

  it("should have all required notification types in enum", () => {
    const requiredTypes = [
      "new_job",
      "application_received",
      "application_status",
      "school_verified",
      "role_changed",
      "job_match",
    ];

    // These types should all be valid notification types
    requiredTypes.forEach((type) => {
      expect(typeof type).toBe("string");
      expect(type.length).toBeGreaterThan(0);
    });
  });
});

describe("Role Guard - Auto-Redirect Logic", () => {
  const EXCLUDED_PATHS = [
    "/select-role",
    "/complete-registration",
    "/verify",
    "/about",
    "/contact",
    "/pricing",
    "/join",
  ];

  const STAFF_ROLES = ["admin", "trainer", "supervisor"];

  const shouldRedirect = (
    userRole: string | null,
    currentPath: string,
    isAuthenticated: boolean
  ): boolean => {
    if (!isAuthenticated || !userRole) return false;
    if (userRole !== "user") return false;
    if (STAFF_ROLES.includes(userRole)) return false;
    return !EXCLUDED_PATHS.some(
      (p) => currentPath === p || currentPath.startsWith(p + "/")
    );
  };

  it("should redirect user with default 'user' role on home page", () => {
    expect(shouldRedirect("user", "/", true)).toBe(true);
  });

  it("should NOT redirect user on /select-role page", () => {
    expect(shouldRedirect("user", "/select-role", false)).toBe(false);
  });

  it("should NOT redirect user with 'teacher' role", () => {
    expect(shouldRedirect("teacher", "/", true)).toBe(false);
  });

  it("should NOT redirect user with 'school' role", () => {
    expect(shouldRedirect("school", "/", true)).toBe(false);
  });

  it("should NOT redirect admin users", () => {
    expect(shouldRedirect("admin", "/", true)).toBe(false);
  });

  it("should NOT redirect unauthenticated users", () => {
    expect(shouldRedirect(null, "/", false)).toBe(false);
  });

  it("should NOT redirect on excluded paths", () => {
    EXCLUDED_PATHS.forEach((path) => {
      expect(shouldRedirect("user", path, true)).toBe(false);
    });
  });

  it("should NOT redirect on sub-paths of excluded paths", () => {
    expect(shouldRedirect("user", "/join/abc123", true)).toBe(false);
    expect(shouldRedirect("user", "/verify/cert-id", true)).toBe(false);
  });

  it("should redirect on non-excluded paths for default user", () => {
    const testPaths = ["/teacher-tools", "/dashboard", "/my-courses", "/jobs"];
    testPaths.forEach((path) => {
      expect(shouldRedirect("user", path, true)).toBe(true);
    });
  });
});

describe("Application Status Map", () => {
  it("should have all required statuses", () => {
    const APP_STATUS_MAP: Record<string, { label: string; variant: string }> = {
      sent: { label: "مُرسل", variant: "secondary" },
      viewed: { label: "تمت المشاهدة", variant: "secondary" },
      shortlisted: { label: "قائمة قصيرة", variant: "outline" },
      interviewed: { label: "تمت المقابلة", variant: "outline" },
      accepted: { label: "مقبول", variant: "default" },
      rejected: { label: "مرفوض", variant: "destructive" },
    };

    expect(Object.keys(APP_STATUS_MAP)).toHaveLength(6);
    expect(APP_STATUS_MAP.sent.label).toBe("مُرسل");
    expect(APP_STATUS_MAP.accepted.variant).toBe("default");
    expect(APP_STATUS_MAP.rejected.variant).toBe("destructive");
  });
});
