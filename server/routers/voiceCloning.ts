import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { voiceClones, leaderPoints, pointsTransactions, users } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { storagePut } from "../storage";
import { ENV } from "../_core/env";

// ============ CONSTANTS ============
const VOICE_CLONE_TTS_COST = 5;
const IMAGE_GENERATION_COST = 3;
const STANDARD_TTS_COST = 1;

// ElevenLabs API base URL
const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

// ============ ELEVENLABS HELPERS ============

/**
 * Check if ElevenLabs API key is configured
 */
function isElevenLabsConfigured(): boolean {
  return !!ENV.ELEVENLABS_API_KEY && ENV.ELEVENLABS_API_KEY.length > 10;
}

/**
 * Create an Instant Voice Clone on ElevenLabs
 * POST https://api.elevenlabs.io/v1/voices/add
 * multipart/form-data: name, files, remove_background_noise, description, labels
 * Returns: { voice_id: string, requires_verification: boolean }
 */
async function elevenLabsCreateVoiceClone(
  audioUrl: string,
  userName: string
): Promise<{ voiceId: string }> {
  if (!isElevenLabsConfigured()) {
    throw new Error("ElevenLabs API key is not configured");
  }

  // Download the audio file from S3
  const audioResponse = await fetch(audioUrl);
  if (!audioResponse.ok) {
    throw new Error(`Failed to download audio sample: ${audioResponse.status}`);
  }
  const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

  // Build multipart form data
  const formData = new FormData();
  formData.append("name", `LeaderAcademy_${userName}_${Date.now()}`);
  formData.append(
    "files",
    new Blob([audioBuffer], { type: "audio/webm" }),
    "voice_sample.webm"
  );
  formData.append("remove_background_noise", "true");
  formData.append("description", `Voice clone for ${userName} - Leader Academy`);
  formData.append("labels", JSON.stringify({ platform: "leader_academy", language: "ar" }));

  const response = await fetch(`${ELEVENLABS_BASE_URL}/voices/add`, {
    method: "POST",
    headers: {
      "xi-api-key": ENV.ELEVENLABS_API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[ElevenLabs] Voice clone creation failed:", response.status, errorText);
    throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
  }

  const result = await response.json() as { voice_id: string; requires_verification: boolean };
  console.log("[ElevenLabs] Voice clone created:", result.voice_id);
  return { voiceId: result.voice_id };
}

/**
 * Generate TTS audio using ElevenLabs with a specific voice_id
 * POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
 * Returns: audio buffer (mpeg)
 */
async function elevenLabsTextToSpeech(
  voiceId: string,
  text: string
): Promise<Buffer> {
  if (!isElevenLabsConfigured()) {
    throw new Error("ElevenLabs API key is not configured");
  }

  const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": ENV.ELEVENLABS_API_KEY,
      "Content-Type": "application/json",
      "Accept": "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2", // Supports Arabic
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[ElevenLabs] TTS failed:", response.status, errorText);
    throw new Error(`ElevenLabs TTS error (${response.status}): ${errorText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

/**
 * Delete a voice from ElevenLabs
 * DELETE https://api.elevenlabs.io/v1/voices/{voice_id}
 */
async function elevenLabsDeleteVoice(voiceId: string): Promise<void> {
  if (!isElevenLabsConfigured() || !voiceId || voiceId.startsWith("clone_")) {
    // Skip deletion for non-ElevenLabs voices (simulated ones)
    return;
  }

  try {
    const response = await fetch(`${ELEVENLABS_BASE_URL}/voices/${voiceId}`, {
      method: "DELETE",
      headers: {
        "xi-api-key": ENV.ELEVENLABS_API_KEY,
      },
    });
    if (!response.ok) {
      console.warn("[ElevenLabs] Voice deletion warning:", response.status);
    }
  } catch (err) {
    console.warn("[ElevenLabs] Voice deletion error:", err);
  }
}

/**
 * Fallback: Generate TTS using built-in Forge API (when ElevenLabs is not configured)
 */
async function forgeTTS(text: string, voice: string = "alloy"): Promise<Buffer> {
  const response = await fetch(`${ENV.forgeApiUrl}/v1/audio/speech`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ENV.forgeApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      input: text,
      voice,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    throw new Error(`Forge TTS error: ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

// ============ POINTS HELPERS ============

/**
 * Check if a user is an admin or the platform owner.
 * Admins and owners get unlimited points.
 */
async function isAdminOrOwner(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return false;
  // Check if admin role
  if (user.role === "admin") return true;
  // Check if platform owner by openId
  if (ENV.ownerOpenId && user.openId === ENV.ownerOpenId) return true;
  return false;
}

const INITIAL_BALANCE = 500; // Generous initial balance for new users
const ADMIN_BALANCE = 999999; // Virtually unlimited for admins

async function ensurePointsRecord(userId: number) {
  const db = await getDb();
  const isAdmin = await isAdminOrOwner(userId);
  const existing = await db!.select().from(leaderPoints).where(eq(leaderPoints.userId, userId)).limit(1);
  
  if (existing.length === 0) {
    const initBalance = isAdmin ? ADMIN_BALANCE : INITIAL_BALANCE;
    await db!.insert(leaderPoints).values({ userId, balance: initBalance, totalEarned: initBalance, totalSpent: 0 });
    return { balance: initBalance, totalEarned: initBalance, totalSpent: 0 };
  }
  
  // If admin/owner has low balance, auto-refill to unlimited
  if (isAdmin && existing[0].balance < 10000) {
    await db!.update(leaderPoints)
      .set({ balance: ADMIN_BALANCE, totalEarned: existing[0].totalEarned + (ADMIN_BALANCE - existing[0].balance) })
      .where(eq(leaderPoints.userId, userId));
    return { ...existing[0], balance: ADMIN_BALANCE, totalEarned: existing[0].totalEarned + (ADMIN_BALANCE - existing[0].balance) };
  }
  
  return existing[0];
}

async function deductPoints(userId: number, amount: number, description: string, featureUsed: string, referenceId?: string) {
  const db = await getDb();
  const points = await ensurePointsRecord(userId);
  
  // Admin/owner bypass: never block, auto-refill if needed
  const isAdmin = await isAdminOrOwner(userId);
  if (isAdmin) {
    // Don't actually deduct for admins, just log the transaction
    await db!.insert(pointsTransactions).values({
      userId,
      type: "spend",
      amount: -amount,
      balanceAfter: points.balance,
      description: `[Admin] ${description}`,
      featureUsed,
      referenceId,
    });
    return points.balance; // Return same balance, no deduction
  }

  if (points.balance < amount) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `رصيدك غير كافٍ. تحتاج ${amount} نقطة ولديك ${points.balance} نقطة فقط.`,
    });
  }

  const newBalance = points.balance - amount;
  await db!.update(leaderPoints)
    .set({ balance: newBalance, totalSpent: points.totalSpent + amount })
    .where(eq(leaderPoints.userId, userId));

  await db!.insert(pointsTransactions).values({
    userId,
    type: "spend",
    amount: -amount,
    balanceAfter: newBalance,
    description,
    featureUsed,
    referenceId,
  });

  return newBalance;
}

// ============ ROUTER ============

export const voiceCloningRouter = router({

  // ========== Points Management ==========

  getMyPoints: protectedProcedure.query(async ({ ctx }) => {
    const points = await ensurePointsRecord(ctx.user.id);
    return {
      balance: points.balance,
      totalEarned: points.totalEarned,
      totalSpent: points.totalSpent,
    };
  }),

  getPointsHistory: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(20) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const transactions = await db!.select()
        .from(pointsTransactions)
        .where(eq(pointsTransactions.userId, ctx.user.id))
        .orderBy(desc(pointsTransactions.createdAt))
        .limit(input.limit);
      return transactions;
    }),

  // ========== Voice Clone Management ==========

  getMyVoiceClone: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const clones = await db!.select()
      .from(voiceClones)
      .where(eq(voiceClones.userId, ctx.user.id))
      .orderBy(desc(voiceClones.createdAt))
      .limit(1);
    return clones[0] || null;
  }),

  // Check if ElevenLabs is configured (for frontend UI)
  getVoiceCloneStatus: protectedProcedure.query(() => {
    return {
      elevenLabsConfigured: isElevenLabsConfigured(),
      provider: isElevenLabsConfigured() ? "elevenlabs" : "builtin_simulation",
    };
  }),

  // Upload voice sample to S3
  uploadVoiceSample: protectedProcedure
    .input(z.object({
      audioBase64: z.string(),
      durationSeconds: z.number().min(10).max(120),
      mimeType: z.string().default("audio/webm"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      // Convert base64 to buffer
      const audioBuffer = Buffer.from(input.audioBase64, "base64");

      // Upload to S3
      const fileKey = `voice-samples/${ctx.user.id}-${Date.now()}.webm`;
      const { url } = await storagePut(fileKey, audioBuffer, input.mimeType);

      // Check if user already has a voice clone record
      const existing = await db!.select()
        .from(voiceClones)
        .where(eq(voiceClones.userId, ctx.user.id))
        .limit(1);

      if (existing.length > 0) {
        await db!.update(voiceClones)
          .set({
            sampleAudioUrl: url,
            sampleAudioKey: fileKey,
            sampleDurationSeconds: Math.round(input.durationSeconds),
            status: "recording",
            externalVoiceId: null,
            errorMessage: null,
          })
          .where(eq(voiceClones.id, existing[0].id));
        return { id: existing[0].id, sampleUrl: url };
      } else {
        const result = await db!.insert(voiceClones).values({
          userId: ctx.user.id,
          sampleAudioUrl: url,
          sampleAudioKey: fileKey,
          sampleDurationSeconds: Math.round(input.durationSeconds),
          status: "recording",
        });
        return { id: Number(result[0].insertId), sampleUrl: url };
      }
    }),

  // Create voice clone from uploaded sample
  createVoiceClone: protectedProcedure
    .input(z.object({ voiceCloneId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      const clones = await db!.select()
        .from(voiceClones)
        .where(and(
          eq(voiceClones.id, input.voiceCloneId),
          eq(voiceClones.userId, ctx.user.id)
        ))
        .limit(1);

      if (clones.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "لم يتم العثور على التسجيل الصوتي" });
      }

      const clone = clones[0];
      if (!clone.sampleAudioUrl) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "لم يتم رفع عينة صوتية بعد" });
      }

      // Update status to processing
      await db!.update(voiceClones)
        .set({ status: "processing" })
        .where(eq(voiceClones.id, clone.id));

      try {
        let voiceId: string;

        if (isElevenLabsConfigured()) {
          // ===== REAL ElevenLabs API Call =====
          console.log("[VoiceClone] Using ElevenLabs API for voice cloning...");
          const result = await elevenLabsCreateVoiceClone(
            clone.sampleAudioUrl,
            ctx.user.name || `user_${ctx.user.id}`
          );
          voiceId = result.voiceId;
          console.log("[VoiceClone] ElevenLabs voice created:", voiceId);
        } else {
          // ===== Fallback: Simulated clone =====
          console.log("[VoiceClone] ElevenLabs not configured, using simulation...");
          voiceId = `sim_clone_${ctx.user.id}_${Date.now()}`;
        }

        await db!.update(voiceClones)
          .set({
            status: "ready",
            externalVoiceId: voiceId,
            errorMessage: null,
          })
          .where(eq(voiceClones.id, clone.id));

        return {
          success: true,
          voiceId,
          status: "ready",
          provider: isElevenLabsConfigured() ? "elevenlabs" : "simulation",
        };
      } catch (error: any) {
        console.error("[VoiceClone] Error:", error.message);
        await db!.update(voiceClones)
          .set({
            status: "failed",
            errorMessage: error.message || "فشل في إنشاء البصمة الصوتية",
          })
          .where(eq(voiceClones.id, clone.id));

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `فشل في إنشاء البصمة الصوتية: ${error.message}`,
        });
      }
    }),

  // Generate TTS with cloned voice (costs points)
  generateWithClonedVoice: protectedProcedure
    .input(z.object({
      text: z.string().min(1).max(5000),
      voiceCloneId: z.number(),
      sceneIndex: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      // Verify voice clone exists and is ready
      const clones = await db!.select()
        .from(voiceClones)
        .where(and(
          eq(voiceClones.id, input.voiceCloneId),
          eq(voiceClones.userId, ctx.user.id)
        ))
        .limit(1);

      if (clones.length === 0 || clones[0].status !== "ready") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "البصمة الصوتية غير جاهزة. يرجى إنشاء بصمة صوتية أولاً.",
        });
      }

      let externalVoiceId = clones[0].externalVoiceId || "";
      const isSimulatedVoice = !externalVoiceId || externalVoiceId.startsWith("sim_") || externalVoiceId.startsWith("clone_");

      // Auto-upgrade: if ElevenLabs is now configured but voice was created with simulation,
      // automatically re-create the voice clone with the real API
      if (isElevenLabsConfigured() && isSimulatedVoice && clones[0].sampleAudioUrl) {
        console.log("[VoiceClone TTS] Auto-upgrading simulated voice to real ElevenLabs clone...");
        try {
          const result = await elevenLabsCreateVoiceClone(
            clones[0].sampleAudioUrl,
            ctx.user.name || `user_${ctx.user.id}`
          );
          externalVoiceId = result.voiceId;
          // Update the database with the real voice ID
          await db!.update(voiceClones)
            .set({
              externalVoiceId: result.voiceId,
              externalProvider: "elevenlabs",
            })
            .where(eq(voiceClones.id, clones[0].id));
          console.log("[VoiceClone TTS] Auto-upgrade successful, new voice ID:", result.voiceId);
        } catch (upgradeErr: any) {
          console.error("[VoiceClone TTS] Auto-upgrade failed:", upgradeErr.message);
          // Continue with fallback TTS instead of failing completely
        }
      }

      // Re-check if we now have a real voice ID after potential auto-upgrade
      const hasRealVoice = isElevenLabsConfigured() && externalVoiceId && !externalVoiceId.startsWith("sim_") && !externalVoiceId.startsWith("clone_");

      // Deduct points (Credit Guard)
      const newBalance = await deductPoints(
        ctx.user.id,
        VOICE_CLONE_TTS_COST,
        `توليد صوت مستنسخ - ${input.text.substring(0, 50)}...`,
        "voice_clone_tts",
        input.sceneIndex !== undefined ? `scene_${input.sceneIndex}` : undefined
      );

      try {
        let audioBuffer: Buffer;

        if (hasRealVoice) {
          // ===== REAL ElevenLabs TTS with cloned voice =====
          console.log("[VoiceClone TTS] Using ElevenLabs with voice:", externalVoiceId);
          audioBuffer = await elevenLabsTextToSpeech(externalVoiceId, input.text);
        } else {
          // ===== Fallback: Built-in Forge TTS =====
          console.log("[VoiceClone TTS] Falling back to Forge TTS (no real voice ID)");
          audioBuffer = await forgeTTS(input.text, "alloy");
        }

        const audioKey = `voice-clone-output/${ctx.user.id}/${Date.now()}-scene${input.sceneIndex ?? 0}.mp3`;
        const { url: audioUrl } = await storagePut(audioKey, audioBuffer, "audio/mpeg");

        // Update usage stats
        await db!.update(voiceClones)
          .set({
            totalGenerations: (clones[0].totalGenerations || 0) + 1,
            lastUsedAt: new Date(),
          })
          .where(eq(voiceClones.id, clones[0].id));

        return {
          audioUrl,
          pointsUsed: VOICE_CLONE_TTS_COST,
          remainingBalance: newBalance,
          provider: hasRealVoice ? "elevenlabs" : "builtin_fallback",
        };
      } catch (error: any) {
        // Refund points on failure
        console.error("[VoiceClone TTS] Error, refunding points:", error.message);
        const points = await ensurePointsRecord(ctx.user.id);
        await db!.update(leaderPoints)
          .set({
            balance: points.balance + VOICE_CLONE_TTS_COST,
            totalSpent: points.totalSpent - VOICE_CLONE_TTS_COST,
          })
          .where(eq(leaderPoints.userId, ctx.user.id));

        await db!.insert(pointsTransactions).values({
          userId: ctx.user.id,
          type: "refund",
          amount: VOICE_CLONE_TTS_COST,
          balanceAfter: points.balance + VOICE_CLONE_TTS_COST,
          description: "استرداد - فشل توليد الصوت المستنسخ",
          featureUsed: "voice_clone_tts_refund",
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في توليد الصوت. تم استرداد النقاط.",
        });
      }
    }),

  // Delete voice clone (also deletes from ElevenLabs)
  deleteVoiceClone: protectedProcedure
    .input(z.object({ voiceCloneId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();

      // Get the clone to find the external voice ID
      const clones = await db!.select()
        .from(voiceClones)
        .where(and(
          eq(voiceClones.id, input.voiceCloneId),
          eq(voiceClones.userId, ctx.user.id)
        ))
        .limit(1);

      if (clones.length > 0 && clones[0].externalVoiceId) {
        // Delete from ElevenLabs if it's a real voice
        await elevenLabsDeleteVoice(clones[0].externalVoiceId);
      }

      await db!.delete(voiceClones)
        .where(and(
          eq(voiceClones.id, input.voiceCloneId),
          eq(voiceClones.userId, ctx.user.id)
        ));
      return { success: true };
    }),

  // Get pricing info
  getPricing: protectedProcedure.query(() => {
    return {
      voiceCloneTTS: VOICE_CLONE_TTS_COST,
      standardTTS: STANDARD_TTS_COST,
      imageGeneration: IMAGE_GENERATION_COST,
      initialFreePoints: 100,
      provider: isElevenLabsConfigured() ? "elevenlabs" : "builtin_simulation",
    };
  }),
});
