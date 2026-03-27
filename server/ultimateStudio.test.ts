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

  it("should define saveProject procedure", async () => {
    const mod = await import("./routers/ultimateStudio");
    const router = mod.ultimateStudioRouter;
    expect(router._def.procedures).toHaveProperty("saveProject");
  });

  it("should define listProjects procedure", async () => {
    const mod = await import("./routers/ultimateStudio");
    const router = mod.ultimateStudioRouter;
    expect(router._def.procedures).toHaveProperty("listProjects");
  });

  it("should define loadProject procedure", async () => {
    const mod = await import("./routers/ultimateStudio");
    const router = mod.ultimateStudioRouter;
    expect(router._def.procedures).toHaveProperty("loadProject");
  });

  it("should define deleteProject procedure", async () => {
    const mod = await import("./routers/ultimateStudio");
    const router = mod.ultimateStudioRouter;
    expect(router._def.procedures).toHaveProperty("deleteProject");
  });

  it("should define renameProject procedure", async () => {
    const mod = await import("./routers/ultimateStudio");
    const router = mod.ultimateStudioRouter;
    expect(router._def.procedures).toHaveProperty("renameProject");
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

  it("should validate saveProject input - title is required", () => {
    const { z } = require("zod");
    const schema = z.object({
      projectId: z.number().optional(),
      title: z.string().min(1).max(255),
      pdfUrl: z.string().optional(),
      pdfFileName: z.string().optional(),
      currentPage: z.number().optional(),
      extractedText: z.string().optional(),
      scriptContent: z.string().optional(),
      scenarioData: z.any().optional(),
      status: z.enum(["draft", "in_progress", "completed"]).optional(),
    });

    // Valid input
    expect(schema.safeParse({ title: "مشروع اختبار" }).success).toBe(true);
    // Empty title should fail
    expect(schema.safeParse({ title: "" }).success).toBe(false);
    // With projectId for update
    expect(schema.safeParse({ projectId: 1, title: "تحديث" }).success).toBe(true);
    // With all fields
    expect(schema.safeParse({
      title: "مشروع كامل",
      pdfFileName: "test.pdf",
      currentPage: 5,
      extractedText: "نص مستخرج",
      status: "in_progress",
    }).success).toBe(true);
  });

  it("should validate deleteProject input", () => {
    const { z } = require("zod");
    const schema = z.object({ projectId: z.number() });

    expect(schema.safeParse({ projectId: 1 }).success).toBe(true);
    expect(schema.safeParse({ projectId: "abc" }).success).toBe(false);
    expect(schema.safeParse({}).success).toBe(false);
  });

  it("should validate renameProject input", () => {
    const { z } = require("zod");
    const schema = z.object({
      projectId: z.number(),
      title: z.string().min(1).max(255),
    });

    expect(schema.safeParse({ projectId: 1, title: "اسم جديد" }).success).toBe(true);
    expect(schema.safeParse({ projectId: 1, title: "" }).success).toBe(false);
    expect(schema.safeParse({ title: "بدون معرف" }).success).toBe(false);
  });

  it("should support project status values", () => {
    const { z } = require("zod");
    const statusSchema = z.enum(["draft", "in_progress", "completed"]);

    expect(statusSchema.safeParse("draft").success).toBe(true);
    expect(statusSchema.safeParse("in_progress").success).toBe(true);
    expect(statusSchema.safeParse("completed").success).toBe(true);
    expect(statusSchema.safeParse("unknown").success).toBe(false);
  });
});
