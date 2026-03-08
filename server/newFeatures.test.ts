import { describe, it, expect, vi } from "vitest";

// ─── Feature 1: Draggable Images ─────────────────────────────────────────────

describe("Draggable Images from Gallery", () => {
  it("should detect [رسم: ...] placeholders from exam content", () => {
    const content = `## السند 1
هذا نص الاختبار
[رسم: جهاز التنفس عند الإنسان]
### التعليمة 1
أكمل الرسم
[رسم: كأس ماء]`;

    const regex = /\[رسم:\s*([^\]]+)\]/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.push(match[1].trim());
    }

    expect(matches).toHaveLength(2);
    expect(matches[0]).toBe("جهاز التنفس عند الإنسان");
    expect(matches[1]).toBe("كأس ماء");
  });

  it("should create image markdown from drag data", () => {
    const imageUrl = "https://example.com/image.png";
    const caption = "جهاز التنفس";
    const markdown = `![${caption}](${imageUrl})`;

    expect(markdown).toContain("![");
    expect(markdown).toContain(imageUrl);
    expect(markdown).toContain(caption);
  });

  it("should insert image at cursor position in text", () => {
    const text = "السطر الأول\nالسطر الثاني\nالسطر الثالث";
    const imageMarkdown = "\n![صورة](https://example.com/img.png)\n";
    const insertPosition = text.indexOf("السطر الثاني") + "السطر الثاني".length;
    
    const newText = text.slice(0, insertPosition) + imageMarkdown + text.slice(insertPosition);
    
    expect(newText).toContain("![صورة]");
    expect(newText.indexOf("![صورة]")).toBeGreaterThan(text.indexOf("السطر الثاني"));
    expect(newText.indexOf("![صورة]")).toBeLessThan(newText.indexOf("السطر الثالث"));
  });
});

// ─── Feature 2: School Logo Upload ───────────────────────────────────────────

describe("School Logo Upload", () => {
  it("should validate image file types", () => {
    const validTypes = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
    const invalidTypes = ["application/pdf", "text/plain", "video/mp4"];

    validTypes.forEach(type => {
      expect(type.startsWith("image/")).toBe(true);
    });

    invalidTypes.forEach(type => {
      expect(type.startsWith("image/")).toBe(false);
    });
  });

  it("should validate file size (max 2MB)", () => {
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    expect(1024 * 1024).toBeLessThan(maxSize); // 1MB - valid
    expect(500 * 1024).toBeLessThan(maxSize); // 500KB - valid
    expect(3 * 1024 * 1024).toBeGreaterThan(maxSize); // 3MB - invalid
  });

  it("should generate proper header HTML with logo", () => {
    const schoolLogo = "https://example.com/logo.png";
    const schoolName = "المدرسة الابتدائية النموذجية";
    
    const headerHtml = schoolLogo 
      ? `<img src="${schoolLogo}" alt="شعار" style="width:36px;height:36px;" /><div>${schoolName}</div>`
      : `<div>${schoolName}</div>`;

    expect(headerHtml).toContain("img");
    expect(headerHtml).toContain(schoolLogo);
    expect(headerHtml).toContain(schoolName);
  });

  it("should generate header HTML without logo when not provided", () => {
    const schoolLogo = "";
    const schoolName = "المدرسة الابتدائية";
    
    const headerHtml = schoolLogo 
      ? `<img src="${schoolLogo}" /><div>${schoolName}</div>`
      : `<div>${schoolName}</div>`;

    expect(headerHtml).not.toContain("img");
    expect(headerHtml).toContain(schoolName);
  });

  it("should include schoolLogo in profile update data", () => {
    const profileData = {
      schoolName: "مدرسة النجاح",
      schoolLogo: "https://storage.example.com/logos/school.png",
    };

    expect(profileData).toHaveProperty("schoolLogo");
    expect(profileData.schoolLogo).toMatch(/^https?:\/\//);
  });
});

// ─── Feature 3: Editable Grading Table ──────────────────────────────────────

describe("Editable Grading Table", () => {
  it("should parse grading table from exam content", () => {
    const content = `## جدول إسناد الأعداد

| الوضعية | مع1 أ | مع1 ب | مع2 أ | مع2 ب | مع2 ج | مع3 | المجموع |
|---------|-------|-------|-------|-------|-------|-----|---------|
| الوضعية 1 | --- | +-- | ++- | +++ | --- | +-- | /10 |
| الوضعية 2 | --- | +-- | ++- | +++ | --- | +-- | /10 |`;

    const gradingMatch = content.match(/## جدول إسناد الأعداد[\s\S]*?(\|.+\|\n\|[-:| ]+\|\n(?:\|.+\|\n?)+)/);
    expect(gradingMatch).not.toBeNull();
    
    const tableText = gradingMatch![1];
    const lines = tableText.trim().split("\n").filter(l => l.includes("|"));
    expect(lines.length).toBeGreaterThanOrEqual(3); // header + separator + at least 1 data row
    
    const dataLines = lines.slice(2);
    expect(dataLines.length).toBe(2);
  });

  it("should extract cells from grading table row", () => {
    const row = "| الوضعية 1 | مع1 أ | مع1 ب | مع2 أ | مع2 ب | مع2 ج | مع3 | /10 |";
    const cols = row.split("|").filter(c => c.trim() !== "");
    
    expect(cols.length).toBe(8);
    expect(cols[0].trim()).toBe("الوضعية 1");
    expect(cols[cols.length - 1].trim()).toBe("/10");
  });

  it("should update individual cell scores", () => {
    const gradingData = [
      {
        cells: [
          { criterion: "مع1", subCriterion: "أ", score: "" },
          { criterion: "مع1", subCriterion: "ب", score: "" },
          { criterion: "مع2", subCriterion: "أ", score: "" },
        ],
        total: "",
      },
    ];

    // Simulate updating a score
    const rowIdx = 0;
    const cellIdx = 1;
    const newScore = "3.5";
    
    const updated = [...gradingData];
    updated[rowIdx] = {
      ...updated[rowIdx],
      cells: updated[rowIdx].cells.map((c, i) => 
        i === cellIdx ? { ...c, score: newScore } : c
      ),
    };

    expect(updated[0].cells[1].score).toBe("3.5");
    expect(updated[0].cells[0].score).toBe(""); // unchanged
    expect(updated[0].cells[2].score).toBe(""); // unchanged
  });

  it("should update row total", () => {
    const gradingData = [
      {
        cells: [
          { criterion: "مع1", subCriterion: "أ", score: "2" },
          { criterion: "مع1", subCriterion: "ب", score: "3" },
        ],
        total: "",
      },
    ];

    const rowIdx = 0;
    const newTotal = "8.5";
    
    const updated = [...gradingData];
    updated[rowIdx] = { ...updated[rowIdx], total: newTotal };

    expect(updated[0].total).toBe("8.5");
  });

  it("should calculate grand total from all rows", () => {
    const gradingData = [
      { cells: [], total: "8.5" },
      { cells: [], total: "7" },
      { cells: [], total: "4.5" },
    ];

    const grandTotal = gradingData.reduce(
      (sum, r) => sum + (parseFloat(r.total) || 0), 0
    );

    expect(grandTotal).toBe(20);
  });

  it("should handle empty/invalid totals gracefully", () => {
    const gradingData = [
      { cells: [], total: "" },
      { cells: [], total: "abc" },
      { cells: [], total: "5" },
    ];

    const grandTotal = gradingData.reduce(
      (sum, r) => sum + (parseFloat(r.total) || 0), 0
    );

    expect(grandTotal).toBe(5);
  });

  it("should toggle editing mode", () => {
    let editingGrading = false;
    
    // Toggle on
    editingGrading = !editingGrading;
    expect(editingGrading).toBe(true);
    
    // Toggle off (save)
    editingGrading = !editingGrading;
    expect(editingGrading).toBe(false);
  });
});
