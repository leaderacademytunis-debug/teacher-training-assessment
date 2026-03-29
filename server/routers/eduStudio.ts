import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { generateImage } from "../_core/imageGeneration";
import { ENV } from "../_core/env";
import { storagePut } from "../storage";
import { getDb } from "../db";
import { studioProjects } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

/**
 * Edu-Studio Engine Router
 * Complete video production pipeline:
 * 1. Generate scenario (split text into scenes)
 * 2. Generate visual prompts (cinematic English prompts)
 * 3. Generate voiceover directives (spoken text + performance directions)
 * 4. Generate actual images from visual prompts
 * 5. Generate TTS audio from voiceover text
 * 6. Save/load/manage studio projects
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

      const rawContent = response.choices?.[0]?.message?.content;
      if (!rawContent) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "فشل في توليد السيناريو" });
      }

      try {
        const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
        return JSON.parse(content);
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
   * Step 3: Generate Voiceover Directives
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

      const rawContent = response.choices?.[0]?.message?.content;
      if (!rawContent) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "فشل في توليد أوامر الصوت" });
      }

      try {
        const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
        return JSON.parse(content);
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "فشل في تحليل أوامر الصوت" });
      }
    }),

  /**
   * Step 4: Generate Image for a scene using the visual prompt
   */
  generateSceneImage: protectedProcedure
    .input(z.object({
      sceneNumber: z.number(),
      visualPrompt: z.string().min(5),
    }))
    .mutation(async ({ input }) => {
      const { sceneNumber, visualPrompt } = input;

      try {
        const result = await generateImage({
          prompt: visualPrompt,
        });

        return {
          sceneNumber,
          imageUrl: result.url || "",
          success: true,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `فشل في توليد صورة المشهد ${sceneNumber}: ${error?.message || "خطأ غير معروف"}`,
        });
      }
    }),

  /**
   * Step 5: Generate TTS Audio for a scene voiceover
   * Uses the Forge API's OpenAI-compatible TTS endpoint
   */
  generateSceneAudio: protectedProcedure
    .input(z.object({
      sceneNumber: z.number(),
      spokenText: z.string().min(5),
      voice: z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]).optional().default("nova"),
      speed: z.number().min(0.5).max(2.0).optional().default(1.0),
    }))
    .mutation(async ({ input }) => {
      const { sceneNumber, spokenText, voice, speed } = input;

      if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "\u062e\u062f\u0645\u0629 \u062a\u062d\u0648\u064a\u0644 \u0627\u0644\u0646\u0635 \u0625\u0644\u0649 \u0635\u0648\u062a \u063a\u064a\u0631 \u0645\u0647\u064a\u0623\u0629",
        });
      }

      const baseUrl = ENV.forgeApiUrl.endsWith("/")
        ? ENV.forgeApiUrl
        : `${ENV.forgeApiUrl}/`;
      const fullUrl = new URL("v1/audio/speech", baseUrl).toString();

      // Truncate very long text to avoid TTS API limits
      const truncatedText = spokenText.length > 4500 ? spokenText.slice(0, 4500) + "..." : spokenText;

      // Retry logic: up to 3 attempts with exponential backoff
      const maxRetries = 2;
      let lastError: any = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            await new Promise(r => setTimeout(r, 2000 * attempt));
            console.log(`[TTS] Retry attempt ${attempt}/${maxRetries} for scene ${sceneNumber}`);
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000);

          const response = await fetch(fullUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${ENV.forgeApiKey}`,
            },
            body: JSON.stringify({
              model: "tts-1",
              input: truncatedText,
              voice: voice,
              speed: speed,
              response_format: "mp3",
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
              lastError = new Error(`TTS error (${response.status}): ${errorText}`);
              continue;
            }
            throw new Error(`TTS request failed (${response.status}): ${errorText}`);
          }

          const audioBuffer = Buffer.from(await response.arrayBuffer());

          if (audioBuffer.length < 100) {
            if (attempt < maxRetries) {
              lastError = new Error("TTS returned empty audio");
              continue;
            }
            throw new Error("TTS returned empty audio buffer");
          }

          const randomSuffix = Math.random().toString(36).substring(2, 10);
          const fileKey = `edu-studio/audio/scene-${sceneNumber}-${Date.now()}-${randomSuffix}.mp3`;
          const { url } = await storagePut(fileKey, audioBuffer, "audio/mpeg");

          return { sceneNumber, audioUrl: url, success: true };
        } catch (error: any) {
          lastError = error;
          if (error?.name === "AbortError") {
            lastError = new Error("TTS request timed out after 60s");
          }
          if (attempt === maxRetries) break;
        }
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `\u0641\u0634\u0644 \u0641\u064a \u062a\u0648\u0644\u064a\u062f \u0635\u0648\u062a \u0627\u0644\u0645\u0634\u0647\u062f ${sceneNumber}: ${lastError?.message || "\u062e\u0637\u0623 \u063a\u064a\u0631 \u0645\u0639\u0631\u0648\u0641"}`,
      });
    }),

  /**
   * Step 5b: Auto-Tashkeel - Add Arabic diacritics via LLM for accurate TTS pronunciation
   * This interceptor processes Arabic text through LLM to add full tashkeel (harakat)
   * before sending to TTS engine, dramatically improving Arabic pronunciation accuracy.
   */
  autoTashkeel: protectedProcedure
    .input(z.object({
      text: z.string().min(5),
      voicePrompt: z.string().optional().default(""),
      language: z.enum(["ar", "fr", "en"]).optional().default("ar"),
    }))
    .mutation(async ({ input }) => {
      const { text, voicePrompt, language } = input;

      // Only apply tashkeel for Arabic text
      if (language !== "ar") {
        // For non-Arabic, just apply voice prompt styling if provided
        if (voicePrompt.trim()) {
          try {
            const response = await invokeLLM({
              messages: [
                {
                  role: "system",
                  content: `You are a voice direction expert. Rewrite the following text to match the given performance directions. Keep the same meaning but adjust phrasing for better spoken delivery. Return ONLY the rewritten text, nothing else.`,
                },
                {
                  role: "user",
                  content: `Performance directions: ${voicePrompt}\n\nOriginal text:\n${text}`,
                },
              ],
            });
            const rawContent = response.choices?.[0]?.message?.content;
            const result = typeof rawContent === "string" ? rawContent.trim() : "";
            return { diacritizedText: result || text, original: text, language };
          } catch {
            return { diacritizedText: text, original: text, language };
          }
        }
        return { diacritizedText: text, original: text, language };
      }

      // Arabic tashkeel processing
      try {
        const systemPrompt = voicePrompt.trim()
          ? `أنت خبير لغوي متخصص في اللغة العربية الفصحى. مهمتك:
1. أعد صياغة النص التالي بناءً على توجيهات الأداء المعطاة مع الحفاظ على المعنى الأصلي.
2. قم بتشكيل النص العربي تشكيلاً كاملاً ودقيقاً (الفتحة، الضمة، الكسرة، الشدة، السكون، التنوين) لضمان النطق الصحيح 100% عند تحويله إلى صوت.
3. أعد النص المُشكَّل فقط بدون أي شرح أو تعليق.

توجيهات الأداء: ${voicePrompt}`
          : `أنت خبير لغوي متخصص في اللغة العربية الفصحى. مهمتك:
1. قم بتشكيل النص العربي التالي تشكيلاً كاملاً ودقيقاً (الفتحة، الضمة، الكسرة، الشدة، السكون، التنوين) لضمان النطق الصحيح 100% عند تحويله إلى صوت.
2. لا تغير المعنى أو الكلمات، فقط أضف الحركات.
3. أعد النص المُشكَّل فقط بدون أي شرح أو تعليق.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: text },
          ],
        });

        const rawDiacritized = response.choices?.[0]?.message?.content;
        const diacritizedText = typeof rawDiacritized === "string" ? rawDiacritized.trim() : "";

        if (!diacritizedText || diacritizedText.length < 5) {
          console.warn("[Tashkeel] LLM returned empty or too short result, using original text");
          return { diacritizedText: text, original: text, language };
        }

        return { diacritizedText, original: text, language };
      } catch (error: any) {
        console.error("[Tashkeel] LLM error:", error?.message);
        // Fallback: return original text if tashkeel fails
        return { diacritizedText: text, original: text, language };
      }
    }),

  /**
   * Save a studio project to the database
   */
  saveProject: protectedProcedure
    .input(z.object({
      id: z.number().optional(), // If provided, update existing project
      title: z.string().min(1),
      summary: z.string().optional(),
      referenceText: z.string().optional(),
      sourceBookId: z.string().optional(),
      sourceBookTitle: z.string().optional(),
      numberOfScenes: z.number().optional(),
      visualStyle: z.string().optional(),
      voiceLanguage: z.string().optional(),
      voiceTone: z.string().optional(),
      scenarioData: z.any().optional(),
      visualPromptsData: z.any().optional(),
      voiceoverData: z.any().optional(),
      generatedImages: z.any().optional(),
      generatedAudios: z.any().optional(),
      status: z.enum(["draft", "in_progress", "completed"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      if (input.id) {
        // Update existing project
        const existing = await db.select().from(studioProjects)
          .where(and(eq(studioProjects.id, input.id), eq(studioProjects.userId, userId)))
          .limit(1);

        if (!existing.length) {
          throw new TRPCError({ code: "NOT_FOUND", message: "المشروع غير موجود" });
        }

        await db.update(studioProjects)
          .set({
            title: input.title,
            summary: input.summary || null,
            referenceText: input.referenceText || null,
            sourceBookId: input.sourceBookId || null,
            sourceBookTitle: input.sourceBookTitle || null,
            numberOfScenes: input.numberOfScenes || null,
            visualStyle: input.visualStyle || null,
            voiceLanguage: input.voiceLanguage || null,
            voiceTone: input.voiceTone || null,
            scenarioData: input.scenarioData || null,
            visualPromptsData: input.visualPromptsData || null,
            voiceoverData: input.voiceoverData || null,
            generatedImages: input.generatedImages || null,
            generatedAudios: input.generatedAudios || null,
            status: input.status || "in_progress",
          })
          .where(eq(studioProjects.id, input.id));

        return { id: input.id, message: "تم تحديث المشروع بنجاح" };
      } else {
        // Create new project
        const result = await db.insert(studioProjects).values({
          userId,
          title: input.title,
          summary: input.summary || null,
          referenceText: input.referenceText || null,
          sourceBookId: input.sourceBookId || null,
          sourceBookTitle: input.sourceBookTitle || null,
          numberOfScenes: input.numberOfScenes || null,
          visualStyle: input.visualStyle || null,
          voiceLanguage: input.voiceLanguage || null,
          voiceTone: input.voiceTone || null,
          scenarioData: input.scenarioData || null,
          visualPromptsData: input.visualPromptsData || null,
          voiceoverData: input.voiceoverData || null,
          generatedImages: input.generatedImages || null,
          generatedAudios: input.generatedAudios || null,
          status: input.status || "draft",
        });

        return { id: result[0].insertId, message: "تم حفظ المشروع بنجاح" };
      }
    }),

  /**
   * List user's studio projects
   */
  listProjects: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).optional().default(20),
      offset: z.number().min(0).optional().default(0),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const projects = await db.select({
        id: studioProjects.id,
        title: studioProjects.title,
        summary: studioProjects.summary,
        status: studioProjects.status,
        numberOfScenes: studioProjects.numberOfScenes,
        visualStyle: studioProjects.visualStyle,
        thumbnailUrl: studioProjects.thumbnailUrl,
        sourceBookTitle: studioProjects.sourceBookTitle,
        createdAt: studioProjects.createdAt,
        updatedAt: studioProjects.updatedAt,
      })
        .from(studioProjects)
        .where(eq(studioProjects.userId, userId))
        .orderBy(desc(studioProjects.updatedAt))
        .limit(input.limit)
        .offset(input.offset);

      return projects;
    }),

  /**
   * Get a single studio project with full data
   */
  getProject: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const project = await db.select().from(studioProjects)
        .where(and(eq(studioProjects.id, input.id), eq(studioProjects.userId, userId)))
        .limit(1);

      if (!project.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المشروع غير موجود" });
      }

      return project[0];
    }),

  /**
   * Delete a studio project
   */
  deleteProject: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const userId = ctx.user.id;

      const existing = await db.select().from(studioProjects)
        .where(and(eq(studioProjects.id, input.id), eq(studioProjects.userId, userId)))
        .limit(1);

      if (!existing.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المشروع غير موجود" });
      }

      await db.delete(studioProjects).where(eq(studioProjects.id, input.id));

      return { success: true, message: "تم حذف المشروع بنجاح" };
    }),
});
