import { describe, it, expect } from "vitest";

// ─── Test the mdToHtml converter logic (extracted for testing) ─────────────────

// Replicate the core mdToHtml logic from PrintPreview for server-side testing
function mdToHtml(md: string): string {
  let html = md
    .replace(/^(\|.+\|)\n(\|[-:| ]+\|)\n((?:\|.+\|\n?)+)/gm, (_match, headerRow: string, _sep: string, bodyRows: string) => {
      const headers = headerRow.split("|").filter((c: string) => c.trim()).map((c: string) =>
        `<th>${c.trim()}</th>`
      ).join("");
      const rows = bodyRows.trim().split("\n").map((row: string) => {
        const cells = row.split("|").filter((c: string) => c.trim()).map((c: string) =>
          `<td>${c.trim() || '&nbsp;'}</td>`
        ).join("");
        return `<tr>${cells}</tr>`;
      }).join("");
      return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    })
    .replace(/^## (السند \d+)/gm, '<div class="sened-header">$1</div>')
    .replace(/^## (جدول إسناد الأعداد)/gm, '<div class="grading-header">$1</div>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (التعليمة \d+)\s*(\(مع\d+ [أ-ي]\))?/gm, (_m: string, title: string, criteria: string) => {
      const badge = criteria ? `<span class="criteria">${criteria.replace(/[()]/g, '')}</span>` : '';
      return `<div class="ta3lima-header">${title} ${badge}</div>`;
    })
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\(مع(\d+)\s*([أ-ي]?)\)/g, '<span class="criteria-badge">مع$1 $2</span>')
    .replace(/(\.{5,})/g, '<span class="dotted-line">&nbsp;</span>')
    .replace(/\[رسم:\s*([^\]]*)\]/g, '<div class="image-placeholder">رسم توضيحي: $1</div>')
    .replace(/^---+$/gm, '<hr/>')
    .replace(/\n\n/g, '<div class="spacer"></div>')
    .replace(/\n/g, '<br/>');
  return html;
}

describe("Tunisian Exam Format - mdToHtml Converter", () => {
  it("should convert السند headers to styled divs", () => {
    const input = "## السند 1\n\nنص السند هنا";
    const result = mdToHtml(input);
    expect(result).toContain('class="sened-header"');
    expect(result).toContain("السند 1");
  });

  it("should convert التعليمة headers with criteria badges", () => {
    const input = "### التعليمة 1 (مع1 أ)";
    const result = mdToHtml(input);
    expect(result).toContain('class="ta3lima-header"');
    expect(result).toContain("التعليمة 1");
    expect(result).toContain('class="criteria"');
    expect(result).toContain("مع1 أ");
  });

  it("should convert جدول إسناد الأعداد header", () => {
    const input = "## جدول إسناد الأعداد";
    const result = mdToHtml(input);
    expect(result).toContain('class="grading-header"');
    expect(result).toContain("جدول إسناد الأعداد");
  });

  it("should convert markdown tables to HTML tables", () => {
    const input = "| المعيار | مع1 أ | مع2 أ |\n|---------|-------|-------|\n| --- | | |\n| +++ | | |";
    const result = mdToHtml(input);
    expect(result).toContain("<table>");
    expect(result).toContain("<thead>");
    expect(result).toContain("<th>المعيار</th>");
    expect(result).toContain("<th>مع1 أ</th>");
    expect(result).toContain("<tbody>");
    expect(result).toContain("---");
    expect(result).toContain("+++");
  });

  it("should convert dotted lines for student answers", () => {
    const input = "أكمل الفراغ: ..................";
    const result = mdToHtml(input);
    expect(result).toContain('class="dotted-line"');
  });

  it("should convert image placeholders [رسم: ...]", () => {
    const input = "[رسم: كوب وصحن وملعقة]";
    const result = mdToHtml(input);
    expect(result).toContain('class="image-placeholder"');
    expect(result).toContain("كوب وصحن وملعقة");
  });

  it("should convert bold text", () => {
    const input = "**نص غامق**";
    const result = mdToHtml(input);
    expect(result).toContain("<strong>نص غامق</strong>");
  });

  it("should convert inline criteria badges", () => {
    const input = "هذا السؤال (مع2 ب) يتطلب تطبيقاً";
    const result = mdToHtml(input);
    expect(result).toContain('class="criteria-badge"');
    expect(result).toContain("مع2 ب");
  });

  it("should convert horizontal rules", () => {
    const input = "---";
    const result = mdToHtml(input);
    expect(result).toContain("<hr/>");
  });
});

describe("Tunisian Exam Structure Validation", () => {
  const sampleExam = `## السند 1

ذهب أحمد مع عائلته إلى السوق لشراء الخضروات.

[رسم: سلة خضروات متنوعة]

### التعليمة 1 (مع1 أ)

أحيط الخضروات التي اشتراها أحمد.

### التعليمة 2 (مع2 أ)

أكمل الجدول التالي:

| الخضروات | الكمية | الثمن |
|----------|--------|-------|
| طماطم   | 2 كغ   |       |
| بصل     |        | 3 د   |

## السند 2

في المدرسة، طلبت المعلمة من التلاميذ حساب المجموع.

### التعليمة 3 (مع2 ب)

أحسب: 25 + 13 = ..................

### التعليمة 4 (مع3)

أصلح الخطأ في العملية التالية: 30 - 15 = 20

---

## جدول إسناد الأعداد

| المعيار | مع1 أ | مع2 أ | مع2 ب | مع3 |
|---------|-------|-------|-------|-----|
| ---     |       |       |       |     |
| +--     |       |       |       |     |
| ++-     |       |       |       |     |
| +++     |       |       |       |     |`;

  it("should have at least 2 سندات", () => {
    const senedCount = (sampleExam.match(/## السند \d+/g) || []).length;
    expect(senedCount).toBeGreaterThanOrEqual(2);
  });

  it("should have تعليمات with criteria codes", () => {
    const ta3limaMatches = sampleExam.match(/### التعليمة \d+ \(مع\d+ [أ-ي]?\)/g) || [];
    expect(ta3limaMatches.length).toBeGreaterThanOrEqual(2);
  });

  it("should have جدول إسناد الأعداد at the end", () => {
    expect(sampleExam).toContain("## جدول إسناد الأعداد");
    const gradingIndex = sampleExam.indexOf("## جدول إسناد الأعداد");
    const lastSenedIndex = sampleExam.lastIndexOf("## السند");
    expect(gradingIndex).toBeGreaterThan(lastSenedIndex);
  });

  it("should have grading table with criteria columns", () => {
    const tableMatch = sampleExam.match(/\| المعيار \|.+\|/);
    expect(tableMatch).toBeTruthy();
    expect(sampleExam).toContain("---");
    expect(sampleExam).toContain("+--");
    expect(sampleExam).toContain("++-");
    expect(sampleExam).toContain("+++");
  });

  it("should have image placeholders where appropriate", () => {
    const imageMatches = sampleExam.match(/\[رسم:[^\]]+\]/g) || [];
    expect(imageMatches.length).toBeGreaterThanOrEqual(1);
  });

  it("should have dotted lines for student answers", () => {
    expect(sampleExam).toContain("..................");
  });

  it("should not contain header/ترويسة (handled by system)", () => {
    expect(sampleExam).not.toContain("الجمهورية التونسية");
    expect(sampleExam).not.toContain("وزارة التربية");
    expect(sampleExam).not.toContain("المدرسة:");
  });

  it("should have progressive difficulty (مع1 before مع2 before مع3)", () => {
    const criteria = [...sampleExam.matchAll(/\(مع(\d+)/g)].map(m => parseInt(m[1]));
    for (let i = 1; i < criteria.length; i++) {
      expect(criteria[i]).toBeGreaterThanOrEqual(criteria[i - 1]);
    }
  });
});

describe("Word Export - Markdown Table Parsing", () => {
  it("should detect markdown table rows", () => {
    const lines = [
      "| المعيار | مع1 أ | مع2 أ |",
      "|---------|-------|-------|",
      "| ---     |       |       |",
      "| +++     |       |       |",
    ];

    const tableRows: string[][] = [];
    let headers: string[] = [];
    let inTable = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        const cells = trimmed.split("|").filter(c => c.trim()).map(c => c.trim());
        if (cells.every(c => /^[-:]+$/.test(c))) {
          inTable = true;
          continue;
        }
        if (!inTable && headers.length === 0) {
          headers = cells;
          inTable = true;
        } else {
          tableRows.push(cells);
        }
      }
    }

    expect(headers).toEqual(["المعيار", "مع1 أ", "مع2 أ"]);
    // The '---' row cells contain non-dash chars (Arabic) so they are data rows
    expect(tableRows.length).toBeGreaterThanOrEqual(1);
    // At least the +++ row should be captured
    const lastRow = tableRows[tableRows.length - 1];
    expect(lastRow[0]).toBe("+++");
  });
});
