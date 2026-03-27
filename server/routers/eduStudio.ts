import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

/**
 * Edu-Studio Engine Router
 * Converts educational text into a complete video production plan:
 * 1. Generate scenario (split text into scenes)
 * 2. Generate visual prompts (cinematic English prompts for each scene)
 * 3. Generate voiceover directives (spoken text + performance directions)
 */

export const eduStudioRouter = router({
  /**
   * Step 1: Generate Scenario - Analyze reference text and split into scenes
   */
  generateScenario: protectedProcedure
    .input(z.object({
      referenceText: z.string().min(10, "النص المرجعي قصير جداً"),
      targetAudience: z.string().optional().default("تلاميذ المرحلة الابتدائية"),
      numberOfScenes: z.number().min(2).max(8).optional().default(4),
    }))
    .mutation(async ({ input }) => {
      const { referenceText, targetAudience, numberOfScenes } = input;

      const systemPrompt = `أنت مخرج فيديو تعليمي محترف ومتخصص في إنتاج محتوى تعليمي للمناهج التونسية.
مهمتك: تحليل النص المدرسي المُعطى وتقسيمه إلى ${numberOfScenes} مشاهد سينمائية تعليمية.

القواعد:
- كل مشهد يجب أن يحتوي على: رقم المشهد، عنوان قصير، وصف بصري مفصل، والنص التعليمي المرتبط
- المشاهد يجب أن تتدرج منطقياً (مقدمة → شرح → تطبيق → خاتمة)
- استخدم لغة بصرية غنية في الوصف (ألوان، حركات كاميرا، إضاءة)
- الجمهور المستهدف: ${targetAudience}

أجب بصيغة JSON فقط بالشكل التالي:
{
  "title": "عنوان الفيديو التعليمي",
  "summary": "ملخص قصير للفيديو",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "عنوان المشهد",
      "description": "وصف بصري مفصل لما يحدث في المشهد",
      "educationalContent": "المحتوى التعليمي المرتبط بهذا المشهد",
      "duration": 30,
      "transition": "نوع الانتقال (cut, fade, dissolve, zoom)"
    }
  ]
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `النص المدرسي المرجعي:\n\n${referenceText}` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "video_scenario",
            strict: true,
            schema: {
              type: "object",
              properties: {
                title: { type: "string", description: "عنوان الفيديو التعليمي" },
                summary: { type: "string", description: "ملخص قصير" },
                scenes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      sceneNumber: { type: "integer" },
                      title: { type: "string" },
                      description: { type: "string" },
                      educationalContent: { type: "string" },
                      duration: { type: "integer" },
                      transition: { type: "string" },
                    },
                    required: ["sceneNumber", "title", "description", "educationalContent", "duration", "transition"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["title", "summary", "scenes"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent1 = response.choices?.[0]?.message?.content;
      if (!rawContent1) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "فشل في توليد السيناريو" });
      }

      try {
        const content1 = typeof rawContent1 === "string" ? rawContent1 : JSON.stringify(rawContent1);
        return JSON.parse(content1);
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "فشل في تحليل نتيجة السيناريو" });
      }
    }),

  /**
   * Step 2: Generate Visual Prompts - Create cinematic English prompts for each scene
   */
  generateVisualPrompts: protectedProcedure
    .input(z.object({
      scenes: z.array(z.object({
        sceneNumber: z.number(),
        title: z.string(),
        description: z.string(),
        educationalContent: z.string(),
      })),
      visualStyle: z.enum(["3d_animation", "2d_cartoon", "realistic", "whiteboard", "cinematic"]).optional().default("3d_animation"),
    }))
    .mutation(async ({ input }) => {
      const { scenes, visualStyle } = input;

      const styleGuides: Record<string, string> = {
        "3d_animation": "3D Pixar-style animation, vibrant colors, soft lighting, educational 3D characters",
        "2d_cartoon": "2D flat illustration, bold colors, clean lines, educational cartoon style",
        "realistic": "Photorealistic, cinematic lighting, 4K, professional educational documentary",
        "whiteboard": "Whiteboard animation style, hand-drawn, black and white with accent colors",
        "cinematic": "Cinematic 4K, dramatic lighting, professional film grade, educational content",
      };

      const styleGuide = styleGuides[visualStyle] || styleGuides["3d_animation"];

      const systemPrompt = `You are an expert AI prompt engineer specializing in creating visual prompts for AI image/video generation tools (Midjourney, DALL-E, Runway, Sora).

Your task: Convert each Arabic scene description into a HIGH-QUALITY English visual prompt optimized for AI generation.

Rules:
- Each prompt MUST be in English
- Include style keywords: ${styleGuide}
- Include camera angle, lighting, composition details
- Include quality keywords: 4K, ultra-detailed, professional, cinematic
- Each prompt should be 2-3 sentences, rich in visual details
- Add negative prompt suggestions for each scene
- Make prompts copy-paste ready for Midjourney/DALL-E

Respond in JSON format only:
{
  "prompts": [
    {
      "sceneNumber": 1,
      "visualPrompt": "The main English prompt for image/video generation",
      "negativePrompt": "Things to avoid in generation",
      "suggestedTool": "midjourney | dall-e | runway | sora",
      "aspectRatio": "16:9 | 9:16 | 1:1"
    }
  ]
}`;

      const scenesText = scenes.map(s =>
        `Scene ${s.sceneNumber}: "${s.title}"\nDescription: ${s.description}\nEducational Content: ${s.educationalContent}`
      ).join("\n\n");

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate visual prompts for these scenes:\n\n${scenesText}` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "visual_prompts",
            strict: true,
            schema: {
              type: "object",
              properties: {
                prompts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      sceneNumber: { type: "integer" },
                      visualPrompt: { type: "string" },
                      negativePrompt: { type: "string" },
                      suggestedTool: { type: "string" },
                      aspectRatio: { type: "string" },
                    },
                    required: ["sceneNumber", "visualPrompt", "negativePrompt", "suggestedTool", "aspectRatio"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["prompts"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent = response.choices?.[0]?.message?.content;
      if (!rawContent) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "فشل في توليد الأوامر البصرية" });
      }

      try {
        const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
        return JSON.parse(content);
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "فشل في تحليل الأوامر البصرية" });
      }
    }),

  /**
   * Step 3: Generate Voiceover Directives - Extract spoken text with performance directions
   */
  generateVoiceover: protectedProcedure
    .input(z.object({
      scenes: z.array(z.object({
        sceneNumber: z.number(),
        title: z.string(),
        educationalContent: z.string(),
        duration: z.number(),
      })),
      voiceLanguage: z.enum(["ar", "fr", "en"]).optional().default("ar"),
      voiceTone: z.enum(["enthusiastic", "calm", "professional", "storytelling"]).optional().default("enthusiastic"),
    }))
    .mutation(async ({ input }) => {
      const { scenes, voiceLanguage, voiceTone } = input;

      const langNames: Record<string, string> = { ar: "Arabic", fr: "French", en: "English" };
      const toneGuides: Record<string, string> = {
        enthusiastic: "Energetic, upbeat, engaging - like a passionate teacher",
        calm: "Soothing, measured, clear - like a gentle narrator",
        professional: "Authoritative, clear, precise - like a documentary narrator",
        storytelling: "Warm, narrative, immersive - like a storyteller",
      };

      const systemPrompt = `You are an expert voiceover director for educational videos.

Your task: Create voiceover scripts and performance directives for each scene.

Rules:
- Write the voiceover text in ${langNames[voiceLanguage]}
- Tone: ${toneGuides[voiceTone]}
- Include performance directions: pace, emphasis, pauses, emotional cues
- Each voiceover should match the scene duration
- Add timing markers for synchronization
- Include pronunciation notes for technical terms

Respond in JSON format only:
{
  "voiceovers": [
    {
      "sceneNumber": 1,
      "spokenText": "The actual text to be spoken/recorded",
      "performanceNotes": "Direction for the voice actor",
      "pace": "slow | normal | fast",
      "emphasis": ["word1", "word2"],
      "pausePoints": ["after sentence 1", "before conclusion"],
      "estimatedDuration": 30,
      "emotionalTone": "excited | curious | serious | warm"
    }
  ]
}`;

      const scenesText = scenes.map(s =>
        `Scene ${s.sceneNumber}: "${s.title}"\nContent: ${s.educationalContent}\nTarget Duration: ${s.duration}s`
      ).join("\n\n");

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate voiceover scripts for these scenes:\n\n${scenesText}` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "voiceover_directives",
            strict: true,
            schema: {
              type: "object",
              properties: {
                voiceovers: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      sceneNumber: { type: "integer" },
                      spokenText: { type: "string" },
                      performanceNotes: { type: "string" },
                      pace: { type: "string" },
                      emphasis: { type: "array", items: { type: "string" } },
                      pausePoints: { type: "array", items: { type: "string" } },
                      estimatedDuration: { type: "integer" },
                      emotionalTone: { type: "string" },
                    },
                    required: ["sceneNumber", "spokenText", "performanceNotes", "pace", "emphasis", "pausePoints", "estimatedDuration", "emotionalTone"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["voiceovers"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawContent3 = response.choices?.[0]?.message?.content;
      if (!rawContent3) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "فشل في توليد أوامر الصوت" });
      }

      try {
        const content3 = typeof rawContent3 === "string" ? rawContent3 : JSON.stringify(rawContent3);
        return JSON.parse(content3);
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "فشل في تحليل أوامر الصوت" });
      }
    }),
});
