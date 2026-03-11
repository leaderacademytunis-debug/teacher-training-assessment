import { describe, it, expect, vi } from "vitest";
import { nanoid } from "nanoid";

describe("Invite Link Generation", () => {
  it("should generate a unique invite code using nanoid", () => {
    const code = nanoid(12);
    expect(code).toBeDefined();
    expect(code.length).toBe(12);
    expect(typeof code).toBe("string");
  });

  it("should generate different codes each time", () => {
    const code1 = nanoid(12);
    const code2 = nanoid(12);
    expect(code1).not.toBe(code2);
  });

  it("should construct a valid invite URL", () => {
    const code = nanoid(12);
    const origin = "https://leaderacademy.school";
    const url = `${origin}/join/${code}`;
    expect(url).toMatch(/^https:\/\/leaderacademy\.school\/join\/[A-Za-z0-9_-]{12}$/);
  });
});

describe("CSV Export Format", () => {
  it("should generate valid CSV with BOM and Arabic headers", () => {
    const BOM = "\uFEFF";
    const headers = ["الاسم", "البريد الإلكتروني", "الواجب", "النوع", "العلامة", "العلامة القصوى", "التقدير", "درجة التمكن", "الحالة", "تاريخ التسليم", "تاريخ التقييم"];
    const rows = [
      { userName: "أحمد", userEmail: "ahmed@test.com", assignmentTitle: "واجب 1", assignmentType: "lesson_plan", score: 85, maxScore: 100, grade: "جيد جداً", masteryScore: 80, status: "مقيّم", submittedAt: "2026-03-01", gradedAt: "2026-03-02" },
      { userName: "فاطمة", userEmail: "fatma@test.com", assignmentTitle: "واجب 1", assignmentType: "lesson_plan", score: null, maxScore: 100, grade: null, masteryScore: null, status: "لم يُسلّم", submittedAt: null, gradedAt: null },
    ];
    const csvRows = rows.map(r => [
      r.userName, r.userEmail, r.assignmentTitle, r.assignmentType,
      r.score ?? "", r.maxScore, r.grade ?? "", r.masteryScore ?? "",
      r.status, r.submittedAt ?? "", r.gradedAt ?? ""
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = BOM + headers.join(",") + "\n" + csvRows.join("\n");

    expect(csv).toContain(BOM);
    expect(csv).toContain("الاسم");
    expect(csv).toContain("أحمد");
    expect(csv).toContain("فاطمة");
    expect(csv).toContain("\"85\"");
    expect(csv).toContain("\"\""); // null values become empty
    expect(csv.split("\n").length).toBe(3); // header + 2 rows
  });

  it("should handle special characters in CSV values", () => {
    const value = 'He said "hello"';
    const escaped = `"${value.replace(/"/g, '""')}"`;
    expect(escaped).toBe('"He said ""hello"""');
  });
});
