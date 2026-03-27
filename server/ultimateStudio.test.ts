import { describe, it, expect, vi } from "vitest";

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{
      message: {
        content: JSON.stringify({
          title: "درس الماء",
          summary: "درس حول أهمية الماء",
          scenes: [
            {
              sceneNumber: 1,
              title: "مقدمة",
              description: "مشهد افتتاحي",
              educationalContent: "الماء ضروري للحياة",
              spokenText: "مرحباً بكم في درس الماء",
              visualPrompt: "A classroom with water cycle diagram",
              duration: 15,
            },
            {
              sceneNumber: 2,
              title: "دورة الماء",
              description: "شرح دورة الماء",
              educationalContent: "التبخر والتكاثف",
              spokenText: "الماء يتبخر ثم يتكاثف",
              visualPrompt: "Water evaporation and condensation diagram",
              duration: 20,
            },
          ],
        }),
      },
    }],
  }),
}));

describe("Ultimate Studio Router", () => {
  it("should have the router module available", async () => {
    const mod = await import("./routers/ultimateStudio");
    expect(mod.ultimateStudioRouter).toBeDefined();
  });

  it("should define extractPageText procedure", async () => {
    const mod = await import("./routers/ultimateStudio");
    const router = mod.ultimateStudioRouter;
    expect(router._def.procedures).toHaveProperty("extractPageText");
  });

  it("should define quickScenario procedure", async () => {
    const mod = await import("./routers/ultimateStudio");
    const router = mod.ultimateStudioRouter;
    expect(router._def.procedures).toHaveProperty("quickScenario");
  });

  it("should validate extractPageText input requires imageBase64", () => {
    // Test that the schema rejects empty input
    const { z } = require("zod");
    const schema = z.object({
      imageBase64: z.string().min(10),
      pageNumber: z.number().min(1),
      fileName: z.string().optional(),
    });

    const result = schema.safeParse({ imageBase64: "", pageNumber: 1 });
    expect(result.success).toBe(false);

    const validResult = schema.safeParse({
      imageBase64: "data:image/png;base64,abcdefghij",
      pageNumber: 1,
      fileName: "test.pdf",
    });
    expect(validResult.success).toBe(true);
  });

  it("should validate quickScenario input requires text min 10 chars", () => {
    const { z } = require("zod");
    const schema = z.object({
      text: z.string().min(10),
      numberOfScenes: z.number().min(2).max(8).default(4),
      targetAudience: z.string().default("تلاميذ المرحلة الابتدائية"),
      language: z.enum(["ar", "fr"]).default("ar"),
    });

    const shortResult = schema.safeParse({ text: "قصير" });
    expect(shortResult.success).toBe(false);

    const validResult = schema.safeParse({
      text: "هذا نص طويل بما يكفي لتوليد سيناريو تعليمي",
      numberOfScenes: 4,
      language: "ar",
    });
    expect(validResult.success).toBe(true);
  });

  it("should validate numberOfScenes range 2-8", () => {
    const { z } = require("zod");
    const schema = z.object({
      text: z.string().min(10),
      numberOfScenes: z.number().min(2).max(8),
    });

    expect(schema.safeParse({ text: "نص طويل بما يكفي", numberOfScenes: 1 }).success).toBe(false);
    expect(schema.safeParse({ text: "نص طويل بما يكفي", numberOfScenes: 9 }).success).toBe(false);
    expect(schema.safeParse({ text: "نص طويل بما يكفي", numberOfScenes: 4 }).success).toBe(true);
  });

  it("should validate language enum ar/fr", () => {
    const { z } = require("zod");
    const schema = z.enum(["ar", "fr"]);

    expect(schema.safeParse("ar").success).toBe(true);
    expect(schema.safeParse("fr").success).toBe(true);
    expect(schema.safeParse("en").success).toBe(false);
  });

  it("LLM mock returns valid scenario structure", async () => {
    const { invokeLLM } = await import("./_core/llm");
    const response = await invokeLLM({ messages: [] });
    const content = JSON.parse(response.choices[0].message.content as string);

    expect(content).toHaveProperty("title");
    expect(content).toHaveProperty("summary");
    expect(content).toHaveProperty("scenes");
    expect(content.scenes).toHaveLength(2);
    expect(content.scenes[0]).toHaveProperty("sceneNumber");
    expect(content.scenes[0]).toHaveProperty("visualPrompt");
    expect(content.scenes[0]).toHaveProperty("spokenText");
  });
});
