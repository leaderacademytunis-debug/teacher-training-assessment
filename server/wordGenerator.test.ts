import { describe, it, expect } from "vitest";
import { generateAiSuggestionWord } from "./wordGenerator";

describe("generateAiSuggestionWord", () => {
  it("should generate a Word document buffer for AI suggestions", async () => {
    const suggestion = {
      schoolYear: "2025-2026",
      educationLevel: "primary" as const,
      grade: "السنة الثالثة",
      subject: "الرياضيات",
      lessonTitle: "الجمع والطرح",
      duration: 45,
      lessonObjectives: "أن يتمكن التلميذ من إجراء عمليات الجمع والطرح بشكل صحيح",
      materials: "سبورة، أقلام ملونة، بطاقات رقمية",
      introduction: "نبدأ الدرس بمراجعة سريعة للأعداد",
      mainActivities: [
        {
          title: "نشاط الجمع",
          duration: 15,
          description: "يقوم التلاميذ بحل تمارين الجمع على السبورة",
        },
        {
          title: "نشاط الطرح",
          duration: 15,
          description: "يقوم التلاميذ بحل تمارين الطرح باستخدام البطاقات",
        },
      ],
      conclusion: "نراجع ما تعلمناه اليوم ونطرح أسئلة",
      evaluation: "تمارين كتابية فردية",
    };

    const buffer = await generateAiSuggestionWord(suggestion);

    // Verify that a buffer was generated
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);

    // Verify it's a valid DOCX file (starts with PK signature)
    const signature = buffer.toString("hex", 0, 2);
    expect(signature).toBe("504b"); // "PK" in hex
  });

  it("should handle minimal data without optional fields", async () => {
    const suggestion = {
      schoolYear: "2025-2026",
      educationLevel: "middle" as const,
      grade: "السنة السابعة",
      subject: "العلوم",
      lessonTitle: "الخلية",
    };

    const buffer = await generateAiSuggestionWord(suggestion);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(0);

    const signature = buffer.toString("hex", 0, 2);
    expect(signature).toBe("504b");
  });

  it("should handle all education levels correctly", async () => {
    const levels: Array<"primary" | "middle" | "secondary"> = ["primary", "middle", "secondary"];

    for (const level of levels) {
      const suggestion = {
        schoolYear: "2025-2026",
        educationLevel: level,
        grade: "السنة الأولى",
        subject: "اللغة العربية",
        lessonTitle: "القراءة",
      };

      const buffer = await generateAiSuggestionWord(suggestion);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    }
  });
});
