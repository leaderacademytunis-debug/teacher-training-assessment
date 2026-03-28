import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { studioProjects } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Ultimate Studio Router
 * Provides:
 * - Page text extraction via LLM Vision
 * - Quick scenario generation
 * - Project save/load/list/delete for auto-save
 */

export const ultimateStudioRouter = router({
  /**
   * Extract text from a specific PDF page using LLM Vision
   */
  extractPageText: protectedProcedure
    .input(z.object({
      imageBase64: z.string().min(10, "Page image is required"),
      pageNumber: z.number().min(1),
      fileName: z.string().optional(),
      language: z.enum(["ar", "fr", "en"]).default("ar"),
    }))
    .mutation(async ({ input }) => {
      // Dynamic system prompt based on user's UI language
      const systemPrompts: Record<string, string> = {
        ar: `أنت نظام OCR متقدم متخصص في استخراج النصوص من الكتب المدرسية التونسية.
قواعد الاستخراج:
1. استخرج النص بالضبط كما هو مكتوب في الصورة
2. حافظ على التنسيق الأصلي (فقرات، عناوين، قوائم مرقمة)
3. إذا كان النص بالعربية، اكتبه بالعربية. إذا كان بالفرنسية، اكتبه بالفرنسية
4. لا تضف أي تعليقات أو شروحات - فقط النص المستخرج
5. حافظ على ترتيب الفقرات والعناوين كما تظهر في الصفحة
6. إذا وجدت جداول، حاول إعادة تمثيلها بنص منسق
7. إذا لم تجد نصاً واضحاً، أعد وصفاً موجزاً لمحتوى الصفحة
Respond entirely in Arabic.`,
        fr: `Vous êtes un système OCR avancé spécialisé dans l'extraction de texte des manuels scolaires tunisiens.
Règles d'extraction :
1. Extrayez le texte exactement tel qu'il est écrit dans l'image
2. Conservez le formatage original (paragraphes, titres, listes numérotées)
3. Si le texte est en arabe, écrivez-le en arabe. S'il est en français, écrivez-le en français
4. N'ajoutez aucun commentaire ou explication - uniquement le texte extrait
5. Conservez l'ordre des paragraphes et des titres tels qu'ils apparaissent sur la page
6. Si vous trouvez des tableaux, essayez de les représenter en texte formaté
7. Si aucun texte clair n'est trouvé, donnez une brève description du contenu de la page
Répondez entièrement en français.`,
        en: `You are an advanced OCR system specialized in extracting text from Tunisian school textbooks.
Extraction rules:
1. Extract the text exactly as written in the image
2. Preserve original formatting (paragraphs, headings, numbered lists)
3. If text is in Arabic, write it in Arabic. If in French, write it in French
4. Do not add any comments or explanations - only the extracted text
5. Preserve the order of paragraphs and headings as they appear on the page
6. If you find tables, try to represent them as formatted text
7. If no clear text is found, return a brief description of the page content
Respond entirely in English.`,
      };

      const userPrompts: Record<string, string> = {
        ar: `استخرج كل النص الموجود في الصفحة رقم ${input.pageNumber} من الكتاب المدرسي:`,
        fr: `Extrayez tout le texte de la page numéro ${input.pageNumber} du manuel scolaire :`,
        en: `Extract all text from page number ${input.pageNumber} of the textbook:`,
      };

      const lang = input.language || "ar";
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: systemPrompts[lang] || systemPrompts.ar,
            },
            {
              role: "user",
              content: [
                {
                  type: "text" as const,
                  text: userPrompts[lang] || userPrompts.ar,
                },
                {
                  type: "image_url" as const,
                  image_url: {
                    url: input.imageBase64,
                    detail: "high" as const,
                  },
                },
              ],
            },
          ],
        });

        const text = typeof response?.choices?.[0]?.message?.content === "string"
          ? response.choices[0].message.content.trim()
          : "";

        return {
          text,
          pageNumber: input.pageNumber,
          fileName: input.fileName || "",
        };
      } catch (err: any) {
        console.error("[UltimateStudio] Page extraction failed:", err?.message);
        const errorMessages: Record<string, string> = {
          ar: "فشل في استخراج النص من الصفحة. حاول مجدداً.",
          fr: "Échec de l'extraction du texte de la page. Veuillez réessayer.",
          en: "Failed to extract text from the page. Please try again.",
        };
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: errorMessages[input.language] || errorMessages.ar,
        });
      }
    }),

  /**
   * Extract text from an image file (JPG/PNG) using LLM Vision
   */
  extractFromImage: protectedProcedure
    .input(z.object({
      imageBase64: z.string().min(10, "Image data is required"),
      language: z.enum(["ar", "fr", "en"]).default("ar"),
    }))
    .mutation(async ({ input }) => {
      const systemPrompts: Record<string, string> = {
        ar: `أنت نظام OCR متقدم متخصص في استخراج النصوص من الصور والوثائق التعليمية.
قواعد الاستخراج:
1. استخرج النص بالضبط كما هو مكتوب في الصورة
2. حافظ على التنسيق الأصلي (فقرات، عناوين، قوائم)
3. إذا كان النص بالعربية اكتبه بالعربية، وإذا كان بالفرنسية اكتبه بالفرنسية
4. لا تضف أي تعليقات - فقط النص المستخرج
5. إذا وجدت جداول حاول إعادة تمثيلها بنص منسق
أجب بالعربية.`,
        fr: `Vous êtes un système OCR avancé spécialisé dans l'extraction de texte des images et documents éducatifs.
Règles: Extrayez le texte exactement tel qu'il est écrit. Conservez le formatage. N'ajoutez aucun commentaire.
Répondez en français.`,
        en: `You are an advanced OCR system specialized in extracting text from educational images and documents.
Rules: Extract text exactly as written. Preserve formatting. Do not add comments.
Respond in English.`,
      };

      const lang = input.language || "ar";
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompts[lang] || systemPrompts.ar },
            {
              role: "user",
              content: [
                { type: "text" as const, text: "استخرج كل النص الموجود في هذه الصورة:" },
                { type: "image_url" as const, image_url: { url: input.imageBase64, detail: "high" as const } },
              ],
            },
          ],
        });
        const text = typeof response?.choices?.[0]?.message?.content === "string"
          ? response.choices[0].message.content.trim()
          : "";
        return { text };
      } catch (err: any) {
        console.error("[UltimateStudio] Image extraction failed:", err?.message);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "فشل في استخراج النص من الصورة" });
      }
    }),

  /**
   * Extract text from a DOC/DOCX file uploaded as base64
   */
  extractFromDoc: protectedProcedure
    .input(z.object({
      fileBase64: z.string().min(10, "File data is required"),
      fileName: z.string(),
      language: z.enum(["ar", "fr", "en"]).default("ar"),
    }))
    .mutation(async ({ input }) => {
      try {
        // Decode base64 to buffer
        const base64Data = input.fileBase64.includes(",")
          ? input.fileBase64.split(",")[1]
          : input.fileBase64;
        const buffer = Buffer.from(base64Data, "base64");

        // Use mammoth to extract text from DOCX
        let text = "";
        try {
          const mammoth = await import("mammoth");
          const result = await mammoth.extractRawText({ buffer });
          text = result.value.trim();
        } catch {
          // Fallback: try to read as plain text
          text = buffer.toString("utf-8").trim();
        }

        if (!text) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "لم يتم العثور على نص في الملف" });
        }

        return { text, fileName: input.fileName };
      } catch (err: any) {
        if (err instanceof TRPCError) throw err;
        console.error("[UltimateStudio] Doc extraction failed:", err?.message);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "فشل في استخراج النص من الملف" });
      }
    }),

  /**
   * Enhance a visual prompt using AI
   */
  enhancePrompt: protectedProcedure
    .input(z.object({
      prompt: z.string().min(3, "Prompt is too short"),
      style: z.enum(["realistic", "cartoon", "lineart", "educational", "watercolor", "child_friendly"]).default("educational"),
      context: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const styleDescriptions: Record<string, string> = {
        realistic: "Photorealistic, high-resolution photograph, natural lighting, detailed textures, cinematic quality",
        cartoon: "Colorful cartoon illustration, bold outlines, vibrant colors, friendly characters, animated style",
        lineart: "Black and white line art, clean outlines, minimalist, ink drawing style, suitable for printing and coloring",
        educational: "Educational illustration, clear diagrams, labeled elements, infographic style, professional educational material",
        watercolor: "Watercolor painting, soft colors, artistic brushstrokes, gentle gradients, dreamy atmosphere",
        child_friendly: "Children's book illustration, cute characters, bright primary colors, simple shapes, playful and engaging",
      };

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are an expert AI image prompt engineer. Your job is to enhance visual prompts for educational image generation.
Rules:
1. Keep the original educational intent
2. Add specific visual details (lighting, composition, colors, camera angle)
3. Apply the requested style: ${styleDescriptions[input.style]}
4. Make the prompt more descriptive and specific
5. Output ONLY the enhanced prompt in English, nothing else
6. Keep it under 200 words`,
            },
            {
              role: "user",
              content: `Enhance this visual prompt for an educational image:\n\nOriginal prompt: ${input.prompt}\n${input.context ? `Context: ${input.context}` : ""}\nStyle: ${input.style}`,
            },
          ],
        });

        const enhanced = typeof response?.choices?.[0]?.message?.content === "string"
          ? response.choices[0].message.content.trim()
          : input.prompt;

        return { enhancedPrompt: enhanced, style: input.style };
      } catch (err: any) {
        console.error("[UltimateStudio] Prompt enhancement failed:", err?.message);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "فشل في تحسين البرومبت" });
      }
    }),

  /**
   * Generate image with specific style
   */
  generateImageWithStyle: protectedProcedure
    .input(z.object({
      sceneNumber: z.number(),
      visualPrompt: z.string().min(5),
      style: z.enum(["realistic", "cartoon", "lineart", "educational", "watercolor", "child_friendly"]).default("educational"),
    }))
    .mutation(async ({ input }) => {
      const stylePrefix: Record<string, string> = {
        realistic: "Photorealistic cinematic still, professional photography, natural lighting, high detail.",
        cartoon: "Colorful cartoon illustration, bold outlines, vibrant colors, animated style, friendly characters.",
        lineart: "Black and white line art drawing, clean ink outlines, minimalist style, no colors, suitable for printing.",
        educational: "Professional educational illustration, clear and informative, labeled diagram style, clean design.",
        watercolor: "Beautiful watercolor painting, soft artistic brushstrokes, gentle color gradients, dreamy atmosphere.",
        child_friendly: "Children's book illustration, cute simple characters, bright primary colors, playful and engaging.",
      };

      try {
        const { generateImage } = await import("../_core/imageGeneration");
        const fullPrompt = `${stylePrefix[input.style]} ${input.visualPrompt}. No text, no watermarks, 16:9 aspect ratio.`;
        const result = await generateImage({ prompt: fullPrompt });

        return {
          sceneNumber: input.sceneNumber,
          imageUrl: result.url || "",
          style: input.style,
          success: true,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `فشل في توليد صورة المشهد ${input.sceneNumber}: ${error?.message || "خطأ غير معروف"}`,
        });
      }
    }),

  /**
   * Quick scenario generation optimized for the pipeline flow
   */
  quickScenario: protectedProcedure
    .input(z.object({
      text: z.string().min(10, "Text too short"),
      numberOfScenes: z.number().min(2).max(8).default(4),
      targetAudience: z.string().default("تلاميذ المرحلة الابتدائية"),
      language: z.enum(["ar", "fr"]).default("ar"),
      uiLanguage: z.enum(["ar", "fr", "en"]).default("ar"),
    }))
    .mutation(async ({ input }) => {
      // Dynamic prompts based on content language AND UI language
      const contentLangInstruction = input.language === "fr"
        ? "Rédige tout le contenu des scènes en français."
        : "اكتب محتوى المشاهد بالعربية.";

      const systemPrompts: Record<string, string> = {
        ar: `أنت مخرج فيديو تعليمي محترف. حلل النص المدرسي وقسمه إلى ${input.numberOfScenes} مشاهد سينمائية.
${contentLangInstruction}

لكل مشهد أعطِ:
- عنوان قصير
- وصف بصري مفصل (ألوان، كاميرا، إضاءة)
- النص التعليمي المرتبط
- نص التعليق الصوتي (ما سيُقال)
- أمر بصري بالإنجليزية لتوليد الصورة (Visual Prompt)
- المدة المقترحة بالثواني

أجب بصيغة JSON فقط.`,
        fr: `Vous êtes un réalisateur de vidéos éducatives professionnel. Analysez le texte scolaire et divisez-le en ${input.numberOfScenes} scènes cinématographiques.
${contentLangInstruction}

Pour chaque scène, fournissez :
- Un titre court
- Une description visuelle détaillée (couleurs, caméra, éclairage)
- Le contenu éducatif associé
- Le texte de narration vocale (ce qui sera dit)
- Une commande visuelle en anglais pour générer l'image (Visual Prompt)
- La durée suggérée en secondes

Répondez uniquement en format JSON.`,
        en: `You are a professional educational video director. Analyze the school text and divide it into ${input.numberOfScenes} cinematic scenes.
${contentLangInstruction}

For each scene, provide:
- A short title
- A detailed visual description (colors, camera, lighting)
- The related educational content
- The voice-over text (what will be said)
- A visual prompt in English for image generation (Visual Prompt)
- The suggested duration in seconds

Respond only in JSON format.`,
      };

      const userPrompts: Record<string, string> = {
        ar: `النص المدرسي:\n\n${input.text}\n\nالجمهور: ${input.targetAudience}`,
        fr: `Texte scolaire :\n\n${input.text}\n\nPublic cible : ${input.targetAudience}`,
        en: `School text:\n\n${input.text}\n\nTarget audience: ${input.targetAudience}`,
      };

      const uiLang = input.uiLanguage || "ar";

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: systemPrompts[uiLang] || systemPrompts.ar,
          },
          {
            role: "user",
            content: userPrompts[uiLang] || userPrompts.ar,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "quick_scenario",
            strict: true,
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                summary: { type: "string" },
                scenes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      sceneNumber: { type: "integer" },
                      title: { type: "string" },
                      description: { type: "string" },
                      educationalContent: { type: "string" },
                      spokenText: { type: "string" },
                      visualPrompt: { type: "string" },
                      duration: { type: "integer" },
                    },
                    required: ["sceneNumber", "title", "description", "educationalContent", "spokenText", "visualPrompt", "duration"],
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

      const raw = response.choices?.[0]?.message?.content;
      const errorMsgs: Record<string, { gen: string; parse: string }> = {
        ar: { gen: "فشل في توليد السيناريو", parse: "فشل في تحليل السيناريو" },
        fr: { gen: "Échec de la génération du scénario", parse: "Échec de l'analyse du scénario" },
        en: { gen: "Failed to generate script", parse: "Failed to parse script" },
      };
      const msgs = errorMsgs[uiLang] || errorMsgs.ar;
      if (!raw) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: msgs.gen });

      try {
        return JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw));
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: msgs.parse });
      }
    }),

  // =================== PROJECT SAVE/LOAD ===================

  /**
   * Save or update a project (auto-save or manual save)
   */
  saveProject: protectedProcedure
    .input(z.object({
      projectId: z.number().optional(), // If provided, update existing
      title: z.string().min(1).max(255),
      pdfUrl: z.string().optional(),
      pdfFileName: z.string().optional(),
      currentPage: z.number().optional(),
      extractedText: z.string().optional(),
      scriptContent: z.string().optional(),
      scenarioData: z.any().optional(),
      visualPromptsData: z.any().optional(),
      voiceoverData: z.any().optional(),
      generatedImages: z.any().optional(),
      generatedAudios: z.any().optional(),
      status: z.enum(["draft", "in_progress", "completed"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متوفرة" });

      const userId = ctx.user!.id;

      if (input.projectId) {
        // Update existing project
        const [existing] = await db
          .select({ id: studioProjects.id })
          .from(studioProjects)
          .where(and(
            eq(studioProjects.id, input.projectId),
            eq(studioProjects.userId, userId),
          ))
          .limit(1);

        if (!existing) {
          throw new TRPCError({ code: "NOT_FOUND", message: "المشروع غير موجود" });
        }

        await db.update(studioProjects)
          .set({
            title: input.title,
            pdfUrl: input.pdfUrl ?? null,
            pdfFileName: input.pdfFileName ?? null,
            currentPage: input.currentPage ?? 1,
            extractedText: input.extractedText ?? null,
            scriptContent: input.scriptContent ?? null,
            scenarioData: input.scenarioData ?? null,
            visualPromptsData: input.visualPromptsData ?? null,
            voiceoverData: input.voiceoverData ?? null,
            generatedImages: input.generatedImages ?? null,
            generatedAudios: input.generatedAudios ?? null,
            status: input.status ?? "in_progress",
          })
          .where(eq(studioProjects.id, input.projectId));

        return { id: input.projectId, saved: true };
      } else {
        // Create new project
        const [result] = await db.insert(studioProjects).values({
          userId,
          title: input.title,
          studioType: "ultimate_studio",
          pdfUrl: input.pdfUrl ?? null,
          pdfFileName: input.pdfFileName ?? null,
          currentPage: input.currentPage ?? 1,
          extractedText: input.extractedText ?? null,
          scriptContent: input.scriptContent ?? null,
          scenarioData: input.scenarioData ?? null,
          visualPromptsData: input.visualPromptsData ?? null,
          voiceoverData: input.voiceoverData ?? null,
          generatedImages: input.generatedImages ?? null,
          generatedAudios: input.generatedAudios ?? null,
          status: input.status ?? "draft",
        });

        return { id: result.insertId, saved: true };
      }
    }),

  /**
   * List all projects for the current user (Ultimate Studio only)
   */
  listProjects: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const userId = ctx.user!.id;
      const projects = await db
        .select({
          id: studioProjects.id,
          title: studioProjects.title,
          pdfFileName: studioProjects.pdfFileName,
          status: studioProjects.status,
          studioType: studioProjects.studioType,
          createdAt: studioProjects.createdAt,
          updatedAt: studioProjects.updatedAt,
        })
        .from(studioProjects)
        .where(and(
          eq(studioProjects.userId, userId),
          eq(studioProjects.studioType, "ultimate_studio"),
        ))
        .orderBy(desc(studioProjects.updatedAt))
        .limit(50);

      return projects;
    }),

  /**
   * Load a specific project with all data
   */
  loadProject: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متوفرة" });

      const userId = ctx.user!.id;
      const [project] = await db
        .select()
        .from(studioProjects)
        .where(and(
          eq(studioProjects.id, input.projectId),
          eq(studioProjects.userId, userId),
        ))
        .limit(1);

      if (!project) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المشروع غير موجود" });
      }

      return project;
    }),

  /**
   * Delete a project
   */
  deleteProject: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متوفرة" });

      const userId = ctx.user!.id;
      const [existing] = await db
        .select({ id: studioProjects.id })
        .from(studioProjects)
        .where(and(
          eq(studioProjects.id, input.projectId),
          eq(studioProjects.userId, userId),
        ))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "المشروع غير موجود" });
      }

      await db.delete(studioProjects)
        .where(eq(studioProjects.id, input.projectId));

      return { deleted: true };
    }),

  /**
   * Rename a project
   */
  renameProject: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      title: z.string().min(1).max(255),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "قاعدة البيانات غير متوفرة" });

      const userId = ctx.user!.id;
      await db.update(studioProjects)
        .set({ title: input.title })
        .where(and(
          eq(studioProjects.id, input.projectId),
          eq(studioProjects.userId, userId),
        ));

      return { renamed: true };
    }),
});
