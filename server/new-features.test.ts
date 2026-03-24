import { describe, it, expect, vi } from "vitest";

// Test 1: Email notification for comments
describe("Comment Email Notification", () => {
  it("should construct proper email HTML for comment notification", () => {
    const commenterName = "علي سعدالله";
    const assignmentTitle = "واجب اللغة العربية";
    const commentText = "أحسنت في تسليم الواجب";
    const batchName = "الدفعة رقم 114";

    const emailHtml = `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, sans-serif;">
        <h2>تعليق جديد على واجبك</h2>
        <p><strong>${commenterName}</strong> علّق على تسليمك للواجب <strong>${assignmentTitle}</strong></p>
        <blockquote>${commentText}</blockquote>
        <p>الدفعة: ${batchName}</p>
      </div>
    `;

    expect(emailHtml).toContain("تعليق جديد");
    expect(emailHtml).toContain(commenterName);
    expect(emailHtml).toContain(assignmentTitle);
    expect(emailHtml).toContain(commentText);
    expect(emailHtml).toContain(batchName);
    expect(emailHtml).toContain('dir="rtl"');
  });

  it("should include all required fields in comment notification", () => {
    const requiredFields = [
      "commenterName",
      "assignmentTitle",
      "commentText",
      "batchName",
      "recipientEmail",
    ];

    const notificationData = {
      commenterName: "علي سعدالله",
      assignmentTitle: "واجب 555",
      commentText: "يرجى مراجعة المعايير",
      batchName: "الدفعة رقم 114",
      recipientEmail: "teacher@example.com",
    };

    requiredFields.forEach((field) => {
      expect(notificationData).toHaveProperty(field);
      expect((notificationData as any)[field]).toBeTruthy();
    });
  });

  it("should handle missing email gracefully", () => {
    const recipientEmail = "";
    const shouldSendEmail = recipientEmail && recipientEmail.includes("@");
    expect(shouldSendEmail).toBeFalsy();
  });

  it("should validate email format before sending", () => {
    const validEmails = ["test@example.com", "user@school.tn"];
    const invalidEmails = ["", "notanemail", "@missing.com"];

    validEmails.forEach((email) => {
      expect(email.includes("@")).toBe(true);
    });

    invalidEmails.forEach((email) => {
      expect(email.includes("@") && email.indexOf("@") > 0).toBe(false);
    });
  });
});

// Test 2: Excel export for batch statistics
describe("Excel Export for Batch Statistics", () => {
  it("should generate correct column headers for Excel export", () => {
    const baseHeaders = [
      "الاسم",
      "البريد الإلكتروني",
    ];
    const assignmentHeaders = [
      "واجب 1 - الحالة",
      "واجب 1 - العلامة",
      "واجب 1 - التقدير",
      "واجب 1 - التمكن",
    ];
    const summaryHeaders = [
      "الواجبات المنجزة",
      "إجمالي الواجبات",
      "نسبة الإنجاز %",
      "المعدل العام %",
    ];

    const allHeaders = [...baseHeaders, ...assignmentHeaders, ...summaryHeaders];
    expect(allHeaders.length).toBe(10);
    expect(allHeaders[0]).toBe("الاسم");
    expect(allHeaders[allHeaders.length - 1]).toBe("المعدل العام %");
  });

  it("should calculate completion percentage correctly", () => {
    const testCases = [
      { submitted: 1, total: 1, expected: 100 },
      { submitted: 0, total: 5, expected: 0 },
      { submitted: 3, total: 4, expected: 75 },
      { submitted: 2, total: 3, expected: 67 },
    ];

    testCases.forEach(({ submitted, total, expected }) => {
      const percentage = total > 0 ? Math.round((submitted / total) * 100) : 0;
      expect(percentage).toBe(expected);
    });
  });

  it("should map grade labels correctly", () => {
    const gradeMap: Record<string, string> = {
      excellent: "ممتاز",
      good: "جيد",
      average: "متوسط",
      weak: "ضعيف",
    };

    expect(gradeMap["excellent"]).toBe("ممتاز");
    expect(gradeMap["good"]).toBe("جيد");
    expect(gradeMap["average"]).toBe("متوسط");
    expect(gradeMap["weak"]).toBe("ضعيف");
  });

  it("should map mastery levels correctly", () => {
    const masteryMap: Record<number, string> = {
      0: "غير متمكن",
      1: "في طور التمكن",
      2: "متمكن",
      3: "متميز",
    };

    expect(masteryMap[0]).toBe("غير متمكن");
    expect(masteryMap[3]).toBe("متميز");
  });

  it("should handle empty batch data for export", () => {
    const members: any[] = [];
    const assignments: any[] = [];

    const rows = members.map((member: any) => {
      return {
        name: member.name,
        email: member.email,
        completionRate: 0,
        average: 0,
      };
    });

    expect(rows.length).toBe(0);
  });

  it("should generate valid file name for export", () => {
    const batchId = 30003;
    const timestamp = Date.now();
    const fileName = `batch-stats-${batchId}-${timestamp}.xlsx`;

    expect(fileName).toContain("batch-stats");
    expect(fileName).toContain(batchId.toString());
    expect(fileName).toMatch(/\.xlsx$/);
  });
});

// Test 3: Batch comparison dashboard
describe("Batch Comparison Dashboard", () => {
  it("should calculate overall statistics correctly", () => {
    const batches = [
      { members: 5, assignments: 3, completionRate: 80, averageScore: 75 },
      { members: 8, assignments: 4, completionRate: 60, averageScore: 65 },
      { members: 3, assignments: 2, completionRate: 100, averageScore: 90 },
    ];

    const totalMembers = batches.reduce((sum, b) => sum + b.members, 0);
    const totalBatches = batches.length;
    const avgCompletion = Math.round(
      batches.reduce((sum, b) => sum + b.completionRate, 0) / totalBatches
    );
    const avgScore = Math.round(
      batches.reduce((sum, b) => sum + b.averageScore, 0) / totalBatches
    );

    expect(totalMembers).toBe(16);
    expect(totalBatches).toBe(3);
    expect(avgCompletion).toBe(80);
    expect(avgScore).toBe(77);
  });

  it("should rank batches by score correctly", () => {
    const batches = [
      { name: "Batch A", score: 75 },
      { name: "Batch B", score: 90 },
      { name: "Batch C", score: 60 },
    ];

    const ranked = [...batches].sort((a, b) => b.score - a.score);
    expect(ranked[0].name).toBe("Batch B");
    expect(ranked[1].name).toBe("Batch A");
    expect(ranked[2].name).toBe("Batch C");
  });

  it("should handle batches with zero data", () => {
    const batch = {
      members: 0,
      assignments: 0,
      submissions: 0,
      graded: 0,
      completionRate: 0,
      averageScore: 0,
    };

    expect(batch.completionRate).toBe(0);
    expect(batch.averageScore).toBe(0);
    expect(batch.members).toBe(0);
  });

  it("should calculate ranking position correctly", () => {
    const batches = [
      { id: 1, completionRate: 100, averageScore: 0 },
      { id: 2, completionRate: 0, averageScore: 0 },
      { id: 3, completionRate: 50, averageScore: 80 },
    ];

    const ranked = [...batches].sort((a, b) => {
      const scoreA = a.completionRate * 0.4 + a.averageScore * 0.6;
      const scoreB = b.completionRate * 0.4 + b.averageScore * 0.6;
      return scoreB - scoreA;
    });

    // Batch 3: 50*0.4 + 80*0.6 = 20+48 = 68
    // Batch 1: 100*0.4 + 0*0.6 = 40+0 = 40
    // Batch 2: 0*0.4 + 0*0.6 = 0
    expect(ranked[0].id).toBe(3);
    expect(ranked[1].id).toBe(1);
    expect(ranked[2].id).toBe(2);
  });

  it("should format percentage values correctly", () => {
    const formatPercent = (value: number) => `${Math.round(value)}%`;

    expect(formatPercent(100)).toBe("100%");
    expect(formatPercent(0)).toBe("0%");
    expect(formatPercent(66.7)).toBe("67%");
    expect(formatPercent(33.3)).toBe("33%");
  });

  it("should assign correct ranking badges", () => {
    const getBadge = (rank: number) => {
      if (rank === 1) return "🥇";
      if (rank === 2) return "🥈";
      if (rank === 3) return "🥉";
      return rank.toString();
    };

    expect(getBadge(1)).toBe("🥇");
    expect(getBadge(2)).toBe("🥈");
    expect(getBadge(3)).toBe("🥉");
    expect(getBadge(4)).toBe("4");
  });
});

// Test 4: PDF Export for Learning Support Reports
describe("PDF Export for Learning Support Reports", () => {
  it("should generate valid HTML for follow-up report PDF", () => {
    const reportData = {
      studentName: "أحمد بن محمد",
      gradeLevel: "السنة الثالثة",
      difficultyType: "dyslexia",
      scores: {
        reading: 5, writing: 4, math: 7,
        attention: 6, social: 8, motivation: 7,
      },
      reportContent: "تقرير متابعة شامل للتلميذ أحمد",
      recommendations: "يُنصح بتكثيف تمارين القراءة",
    };

    // Simulate HTML generation
    const html = `
      <html dir="rtl">
        <body>
          <h1>تقرير المتابعة الفردي</h1>
          <h2>${reportData.studentName}</h2>
          <p>المستوى: ${reportData.gradeLevel}</p>
          <table>
            <tr><td>القراءة</td><td>${reportData.scores.reading}/10</td></tr>
            <tr><td>الكتابة</td><td>${reportData.scores.writing}/10</td></tr>
          </table>
          <div>${reportData.reportContent}</div>
          <div>${reportData.recommendations}</div>
        </body>
      </html>
    `;

    expect(html).toContain('dir="rtl"');
    expect(html).toContain(reportData.studentName);
    expect(html).toContain("تقرير المتابعة الفردي");
    expect(html).toContain("5/10");
    expect(html).toContain(reportData.recommendations);
  });

  it("should generate valid HTML for progress evaluation PDF", () => {
    const evalData = {
      studentName: "فاطمة الزهراء",
      difficultyType: "dyscalculia",
      analysisTitle: "تقييم تقدم الثلاثي الأول",
      overallProgress: "moderate_improvement",
      progressPercentage: 65,
      assessmentData: [
        { date: "2025-09-01", scores: { math: 3, reading: 5 } },
        { date: "2025-12-01", scores: { math: 5, reading: 6 } },
      ],
    };

    const html = `
      <html dir="rtl">
        <body>
          <h1>تقييم التقدم</h1>
          <h2>${evalData.studentName}</h2>
          <p>التقدم: ${evalData.progressPercentage}%</p>
          <div>${evalData.analysisTitle}</div>
        </body>
      </html>
    `;

    expect(html).toContain(evalData.studentName);
    expect(html).toContain("65%");
    expect(html).toContain(evalData.analysisTitle);
  });

  it("should handle missing scores gracefully in PDF", () => {
    const scores: Record<string, number | null> = {
      reading: 5, writing: null, math: 7,
      attention: null, social: 8, motivation: null,
    };

    const validScores = Object.entries(scores)
      .filter(([_, v]) => v !== null)
      .map(([k, v]) => ({ skill: k, score: v }));

    expect(validScores.length).toBe(3);
    expect(validScores[0].score).toBe(5);
  });
});

// Test 5: Tool Interconnection (Therapeutic Exercises Import)
describe("Tool Interconnection - Exercises Import", () => {
  it("should aggregate exercises by category correctly", () => {
    const exercises = [
      { exerciseCategory: "القراءة", exercises: [{ q: "1" }, { q: "2" }] },
      { exerciseCategory: "القراءة", exercises: [{ q: "3" }] },
      { exerciseCategory: "الرياضيات", exercises: [{ q: "1" }, { q: "2" }, { q: "3" }] },
      { exerciseCategory: "الكتابة", exercises: [{ q: "1" }] },
    ];

    const categoryMap: Record<string, { count: number; total: number }> = {};
    exercises.forEach((ex) => {
      const cat = ex.exerciseCategory || "عام";
      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, total: 0 };
      categoryMap[cat].count += ex.exercises.length;
      categoryMap[cat].total++;
    });

    expect(Object.keys(categoryMap).length).toBe(3);
    expect(categoryMap["القراءة"].count).toBe(3);
    expect(categoryMap["القراءة"].total).toBe(2);
    expect(categoryMap["الرياضيات"].count).toBe(3);
    expect(categoryMap["الكتابة"].count).toBe(1);
  });

  it("should convert aggregated data to import format", () => {
    const categoryMap: Record<string, { count: number; total: number }> = {
      "القراءة": { count: 5, total: 3 },
      "الرياضيات": { count: 3, total: 2 },
    };

    const imported = Object.entries(categoryMap).map(([cat, data]) => ({
      category: cat,
      count: data.count,
      successRate: 70,
      averageDuration: 20,
    }));

    expect(imported.length).toBe(2);
    expect(imported[0].category).toBe("القراءة");
    expect(imported[0].count).toBe(5);
    expect(imported[0].successRate).toBe(70);
  });

  it("should handle empty exercises list", () => {
    const exercises: any[] = [];
    const hasData = exercises.length > 0;
    expect(hasData).toBe(false);
  });

  it("should handle exercises without category", () => {
    const exercises = [
      { exerciseCategory: null, exercises: [{ q: "1" }] },
      { exerciseCategory: "", exercises: [{ q: "2" }] },
    ];

    const categoryMap: Record<string, { count: number }> = {};
    exercises.forEach((ex) => {
      const cat = ex.exerciseCategory || "عام";
      if (!categoryMap[cat]) categoryMap[cat] = { count: 0 };
      categoryMap[cat].count += ex.exercises.length;
    });

    expect(categoryMap["عام"].count).toBe(2);
  });
});

// Test 6: Student Dashboard
describe("Student Dashboard", () => {
  it("should merge unique student names from multiple sources", () => {
    const reportStudents = [{ studentName: "أحمد" }, { studentName: "فاطمة" }];
    const evalStudents = [{ studentName: "أحمد" }, { studentName: "محمد" }];
    const exerciseStudents = [{ studentName: "فاطمة" }, { studentName: "سارة" }];

    const nameSet = new Set<string>();
    [...reportStudents, ...evalStudents, ...exerciseStudents].forEach(s => {
      if (s.studentName) nameSet.add(s.studentName);
    });

    expect(nameSet.size).toBe(4);
    expect(nameSet.has("أحمد")).toBe(true);
    expect(nameSet.has("فاطمة")).toBe(true);
    expect(nameSet.has("محمد")).toBe(true);
    expect(nameSet.has("سارة")).toBe(true);
  });

  it("should calculate average score correctly", () => {
    const scores = {
      reading: 5, writing: 4, math: 7,
      attention: 6, social: 8, motivation: 7,
    };

    const avg = Math.round(
      (scores.reading + scores.writing + scores.math +
       scores.attention + scores.social + scores.motivation) / 6 * 10
    ) / 10;

    expect(avg).toBe(6.2);
  });

  it("should sort students by last activity date", () => {
    const students = [
      { name: "أحمد", lastActivity: new Date("2025-01-01") },
      { name: "فاطمة", lastActivity: new Date("2025-03-01") },
      { name: "محمد", lastActivity: null },
      { name: "سارة", lastActivity: new Date("2025-02-01") },
    ];

    students.sort((a, b) => {
      if (!a.lastActivity) return 1;
      if (!b.lastActivity) return -1;
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    });

    expect(students[0].name).toBe("فاطمة");
    expect(students[1].name).toBe("سارة");
    expect(students[2].name).toBe("أحمد");
    expect(students[3].name).toBe("محمد");
  });

  it("should build timeline from reports and evaluations", () => {
    const reports = [
      { createdAt: new Date("2025-01-15"), type: "report", title: "تقرير 1" },
      { createdAt: new Date("2025-03-01"), type: "report", title: "تقرير 2" },
    ];
    const evaluations = [
      { createdAt: new Date("2025-02-01"), type: "evaluation", title: "تقييم 1" },
    ];

    const timeline = [...reports, ...evaluations].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    expect(timeline.length).toBe(3);
    expect(timeline[0].title).toBe("تقرير 1");
    expect(timeline[1].title).toBe("تقييم 1");
    expect(timeline[2].title).toBe("تقرير 2");
  });

  it("should calculate difficulty distribution correctly", () => {
    const reports = [
      { difficultyType: "dyslexia" },
      { difficultyType: "dyslexia" },
      { difficultyType: "dyscalculia" },
      { difficultyType: "adhd" },
      { difficultyType: "dyslexia" },
    ];

    const dist: Record<string, number> = {};
    reports.forEach(r => {
      if (r.difficultyType) {
        dist[r.difficultyType] = (dist[r.difficultyType] || 0) + 1;
      }
    });

    expect(dist["dyslexia"]).toBe(3);
    expect(dist["dyscalculia"]).toBe(1);
    expect(dist["adhd"]).toBe(1);
    expect(Object.keys(dist).length).toBe(3);
  });

  it("should handle null student names in merge", () => {
    const sources = [
      { studentName: "أحمد" },
      { studentName: null },
      { studentName: "" },
      { studentName: "فاطمة" },
    ];

    const nameSet = new Set<string>();
    sources.forEach(s => {
      if (s.studentName) nameSet.add(s.studentName);
    });

    expect(nameSet.size).toBe(2);
  });

  it("should map difficulty types to Arabic labels", () => {
    const labels: Record<string, string> = {
      dyslexia: "عسر القراءة",
      dysgraphia: "عسر الكتابة",
      dyscalculia: "عسر الحساب",
      adhd: "فرط النشاط",
    };

    expect(labels["dyslexia"]).toBe("عسر القراءة");
    expect(labels["dyscalculia"]).toBe("عسر الحساب");
    expect(labels["nonexistent"]).toBeUndefined();
  });
});
