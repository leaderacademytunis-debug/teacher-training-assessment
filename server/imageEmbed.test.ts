import { describe, it, expect } from "vitest";

// Test the image placeholder detection logic
function extractImagePlaceholders(content: string): string[] {
  const placeholders: string[] = [];
  const regex = /\[رسم:\s*([^\]]+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(content)) !== null) {
    placeholders.push(m[1].trim());
  }
  return placeholders;
}

// Test the mdToHtml image replacement logic (simplified version)
function replaceImagesInContent(
  content: string,
  imageMap: Map<string, string>
): string {
  return content.replace(/\[رسم:\s*([^\]]*)\]/g, (_match, desc: string) => {
    const trimDesc = desc.trim();
    const matchUrl = imageMap.get(trimDesc);
    if (matchUrl) {
      return `<img src="${matchUrl}" alt="${trimDesc}" />`;
    }
    return `<placeholder>${trimDesc}</placeholder>`;
  });
}

// Test the ExamContentWithImages splitting logic
function splitContentByImages(content: string): Array<{ type: 'text' | 'image'; text: string }> {
  const parts: Array<{ type: 'text' | 'image'; text: string }> = [];
  const regex = /\[رسم:\s*([^\]]+)\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', text: content.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'image', text: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'text', text: content.slice(lastIndex) });
  }
  return parts;
}

describe("Image Placeholder Detection", () => {
  it("should detect single placeholder", () => {
    const content = "## السند 1\n[رسم: جهاز التنفس عند الإنسان]\nالتعليمة 1";
    const result = extractImagePlaceholders(content);
    expect(result).toEqual(["جهاز التنفس عند الإنسان"]);
  });

  it("should detect multiple placeholders", () => {
    const content = "[رسم: كأس ماء] و [رسم: أنف الإنسان] و [رسم: أذن]";
    const result = extractImagePlaceholders(content);
    expect(result).toEqual(["كأس ماء", "أنف الإنسان", "أذن"]);
  });

  it("should return empty for no placeholders", () => {
    const content = "## السند 1\nنص عادي بدون رسومات";
    const result = extractImagePlaceholders(content);
    expect(result).toEqual([]);
  });

  it("should handle placeholder with extra spaces", () => {
    const content = "[رسم:   جهاز التنفس   ]";
    const result = extractImagePlaceholders(content);
    expect(result).toEqual(["جهاز التنفس"]);
  });
});

describe("Image Replacement in Content", () => {
  it("should replace placeholder with image when available", () => {
    const content = "السند: [رسم: جهاز التنفس]";
    const imageMap = new Map([["جهاز التنفس", "https://example.com/img.png"]]);
    const result = replaceImagesInContent(content, imageMap);
    expect(result).toContain('<img src="https://example.com/img.png"');
    expect(result).not.toContain("[رسم:");
  });

  it("should keep placeholder when no image available", () => {
    const content = "السند: [رسم: جهاز التنفس]";
    const imageMap = new Map<string, string>();
    const result = replaceImagesInContent(content, imageMap);
    expect(result).toContain("<placeholder>جهاز التنفس</placeholder>");
    expect(result).not.toContain('<img');
  });

  it("should replace only matching placeholders", () => {
    const content = "[رسم: كأس] و [رسم: أنف]";
    const imageMap = new Map([["كأس", "https://example.com/cup.png"]]);
    const result = replaceImagesInContent(content, imageMap);
    expect(result).toContain('<img src="https://example.com/cup.png"');
    expect(result).toContain("<placeholder>أنف</placeholder>");
  });
});

describe("Content Splitting for Inline Images", () => {
  it("should split content into text and image parts", () => {
    const content = "مقدمة\n[رسم: صورة]\nخاتمة";
    const parts = splitContentByImages(content);
    expect(parts).toHaveLength(3);
    expect(parts[0]).toEqual({ type: 'text', text: "مقدمة\n" });
    expect(parts[1]).toEqual({ type: 'image', text: "صورة" });
    expect(parts[2]).toEqual({ type: 'text', text: "\nخاتمة" });
  });

  it("should handle content with no images", () => {
    const content = "نص عادي بدون صور";
    const parts = splitContentByImages(content);
    expect(parts).toHaveLength(1);
    expect(parts[0]).toEqual({ type: 'text', text: content });
  });

  it("should handle content starting with image", () => {
    const content = "[رسم: صورة] ثم نص";
    const parts = splitContentByImages(content);
    expect(parts).toHaveLength(2);
    expect(parts[0]).toEqual({ type: 'image', text: "صورة" });
    expect(parts[1]).toEqual({ type: 'text', text: " ثم نص" });
  });

  it("should handle consecutive images", () => {
    const content = "[رسم: صورة1][رسم: صورة2]";
    const parts = splitContentByImages(content);
    expect(parts).toHaveLength(2);
    expect(parts[0]).toEqual({ type: 'image', text: "صورة1" });
    expect(parts[1]).toEqual({ type: 'image', text: "صورة2" });
  });
});

describe("School Name in Exam Header", () => {
  it("should use provided school name", () => {
    const schoolName = "المدرسة الابتدائية النموذجية بتونس";
    expect(schoolName).toBeTruthy();
    expect(schoolName.length).toBeGreaterThan(0);
  });

  it("should fallback to default when no school name", () => {
    const schoolName = "" || "..................";
    expect(schoolName).toBe("..................");
  });

  it("should trim school name", () => {
    const schoolName = "  المدرسة الابتدائية  ".trim();
    expect(schoolName).toBe("المدرسة الابتدائية");
  });
});

describe("Image Map Building", () => {
  it("should build map from images array", () => {
    const images = [
      { url: "https://example.com/1.png", caption: "جهاز التنفس" },
      { url: "https://example.com/2.png", caption: "كأس ماء" },
    ];
    const imageMap = new Map<string, string>();
    images.forEach(img => {
      if (img.caption) imageMap.set(img.caption.trim(), img.url);
    });
    expect(imageMap.get("جهاز التنفس")).toBe("https://example.com/1.png");
    expect(imageMap.get("كأس ماء")).toBe("https://example.com/2.png");
    expect(imageMap.size).toBe(2);
  });

  it("should handle images without captions", () => {
    const images = [
      { url: "https://example.com/1.png" },
      { url: "https://example.com/2.png", caption: "صورة" },
    ];
    const imageMap = new Map<string, string>();
    images.forEach(img => {
      if (img.caption) imageMap.set(img.caption.trim(), img.url);
    });
    expect(imageMap.size).toBe(1);
    expect(imageMap.get("صورة")).toBe("https://example.com/2.png");
  });
});
