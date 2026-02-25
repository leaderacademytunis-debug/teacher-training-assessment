import { describe, it, expect } from "vitest";
import { generateAiSuggestionPDF } from "./pdfGenerator";

describe("AI Suggestions Features", () => {
  describe("PDF Generation", () => {
    it("should generate a PDF buffer for AI suggestions with Arabic support", async () => {
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

      const buffer = await generateAiSuggestionPDF(suggestion);

      // Verify that a buffer was generated
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);

      // Verify it's a valid PDF file (starts with %PDF signature)
      const signature = buffer.toString("ascii", 0, 4);
      expect(signature).toBe("%PDF");
    });

    it("should handle minimal data without optional fields", async () => {
      const suggestion = {
        schoolYear: "2025-2026",
        educationLevel: "middle" as const,
        grade: "السنة السابعة",
        subject: "العلوم",
        lessonTitle: "الخلية",
      };

      const buffer = await generateAiSuggestionPDF(suggestion);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);

      const signature = buffer.toString("ascii", 0, 4);
      expect(signature).toBe("%PDF");
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

        const buffer = await generateAiSuggestionPDF(suggestion);
        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBeGreaterThan(0);
      }
    });

    it("should handle long Arabic text content", async () => {
      const suggestion = {
        schoolYear: "2025-2026",
        educationLevel: "secondary" as const,
        grade: "السنة الأولى ثانوي",
        subject: "الفلسفة",
        lessonTitle: "مفهوم الحرية",
        lessonObjectives: "أن يتمكن التلميذ من فهم مفهوم الحرية من منظور فلسفي وأن يميز بين الحرية الإيجابية والحرية السلبية وأن يحلل العلاقة بين الحرية والمسؤولية",
        introduction: "نبدأ الدرس بطرح سؤال فلسفي: هل الإنسان حر حقاً؟ ونناقش مع التلاميذ تصوراتهم الأولية عن الحرية",
        conclusion: "نختم الدرس بتلخيص المفاهيم الأساسية التي تناولناها ونطرح أسئلة تأملية للتفكير",
      };

      const buffer = await generateAiSuggestionPDF(suggestion);
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });
  });
});
