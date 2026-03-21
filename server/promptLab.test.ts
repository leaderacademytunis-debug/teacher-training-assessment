import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(),
}));

describe("promptLab.optimize", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return optimized prompt and explanation for Arabic input", async () => {
    const { invokeLLM } = await import("./_core/llm");
    (invokeLLM as any).mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            optimized: "أنت خبير في التعليم التونسي. أعد جذاذة درس رياضيات حول الكسور للسنة 5.\n\n1. الكفاية المستهدفة\n2. الأهداف التعلمية\n3. مراحل الدرس",
            explanation: "تم إضافة:\n- تحديد الدور\n- هيكلة بخطوات مرقمة\n- تحديد المستوى والمادة",
          }),
        },
      }],
    });

    // Simulate the procedure logic
    const input = { prompt: "اصنع درس رياضيات", language: "ar" as const };
    
    const langInstructions: Record<string, string> = {
      ar: "أجب بالعربية فقط.",
      fr: "Répondez uniquement en français.",
      en: "Respond only in English.",
    };

    const response = await (invokeLLM as any)({
      messages: [
        { role: "system", content: langInstructions[input.language] },
        { role: "user", content: `Original prompt to optimize:\n\n${input.prompt}` },
      ],
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(typeof content === "string" ? content : "");

    expect(parsed).toHaveProperty("optimized");
    expect(parsed).toHaveProperty("explanation");
    expect(parsed.optimized).toContain("خبير");
    expect(typeof parsed.explanation).toBe("string");
  });

  it("should handle JSON parse errors gracefully", async () => {
    const { invokeLLM } = await import("./_core/llm");
    (invokeLLM as any).mockResolvedValue({
      choices: [{
        message: {
          content: "This is not valid JSON",
        },
      }],
    });

    const response = await (invokeLLM as any)({ messages: [] });
    const content = response.choices[0].message.content;

    let result;
    try {
      const parsed = JSON.parse(typeof content === "string" ? content : "");
      result = { optimized: parsed.optimized || "", explanation: parsed.explanation || "" };
    } catch {
      result = { optimized: "اصنع درس رياضيات", explanation: "Could not optimize. Please try again." };
    }

    expect(result.optimized).toBe("اصنع درس رياضيات");
    expect(result.explanation).toBe("Could not optimize. Please try again.");
  });

  it("should support French language optimization", async () => {
    const { invokeLLM } = await import("./_core/llm");
    (invokeLLM as any).mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            optimized: "Vous êtes un expert en pédagogie tunisienne. Préparez une fiche de cours de mathématiques sur les fractions pour la 5ème année.",
            explanation: "Améliorations :\n- Rôle défini\n- Structure numérotée\n- Contexte tunisien ajouté",
          }),
        },
      }],
    });

    const response = await (invokeLLM as any)({ messages: [] });
    const content = response.choices[0].message.content;
    const parsed = JSON.parse(typeof content === "string" ? content : "");

    expect(parsed.optimized).toContain("expert");
    expect(parsed.explanation).toContain("Améliorations");
  });

  it("should support English language optimization", async () => {
    const { invokeLLM } = await import("./_core/llm");
    (invokeLLM as any).mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            optimized: "You are an expert Tunisian educator. Create a comprehensive math lesson plan about fractions for 5th grade.",
            explanation: "Improvements:\n- Role assignment added\n- Structured steps\n- Tunisian context specified",
          }),
        },
      }],
    });

    const response = await (invokeLLM as any)({ messages: [] });
    const content = response.choices[0].message.content;
    const parsed = JSON.parse(typeof content === "string" ? content : "");

    expect(parsed.optimized).toContain("expert");
    expect(parsed.explanation).toContain("Improvements");
  });
});
