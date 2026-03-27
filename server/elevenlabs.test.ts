import { describe, it, expect } from "vitest";

const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";

describe("ElevenLabs API Integration", () => {
  const apiKey = process.env.ELEVENLABS_API_KEY || "";

  it("should have ELEVENLABS_API_KEY configured", () => {
    expect(apiKey).toBeTruthy();
    expect(apiKey.length).toBeGreaterThan(10);
  });

  it("should validate API key by listing voices", async () => {
    if (!apiKey || apiKey.length < 10) {
      console.warn("Skipping: ELEVENLABS_API_KEY not configured");
      return;
    }

    const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
      method: "GET",
      headers: {
        "xi-api-key": apiKey,
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json() as { voices: Array<{ voice_id: string; name: string }> };
    expect(data).toHaveProperty("voices");
    expect(Array.isArray(data.voices)).toBe(true);
    console.log(`[ElevenLabs] API key valid. Found ${data.voices.length} voices available.`);
  });

  it("should have access to multilingual model", async () => {
    if (!apiKey || apiKey.length < 10) {
      console.warn("Skipping: ELEVENLABS_API_KEY not configured");
      return;
    }

    const response = await fetch(`${ELEVENLABS_BASE_URL}/models`, {
      method: "GET",
      headers: {
        "xi-api-key": apiKey,
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json() as Array<{ model_id: string; name: string }>;
    expect(Array.isArray(data)).toBe(true);

    const multilingualModel = data.find((m: any) => m.model_id === "eleven_multilingual_v2");
    expect(multilingualModel).toBeTruthy();
    console.log(`[ElevenLabs] Multilingual v2 model available: ${multilingualModel?.name}`);
  });

  it("should check user subscription info", async () => {
    if (!apiKey || apiKey.length < 10) {
      console.warn("Skipping: ELEVENLABS_API_KEY not configured");
      return;
    }

    const response = await fetch(`${ELEVENLABS_BASE_URL}/user/subscription`, {
      method: "GET",
      headers: {
        "xi-api-key": apiKey,
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json() as {
      tier: string;
      character_count: number;
      character_limit: number;
      can_use_instant_voice_cloning: boolean;
    };
    console.log(`[ElevenLabs] Subscription tier: ${data.tier}`);
    console.log(`[ElevenLabs] Characters used: ${data.character_count}/${data.character_limit}`);
    console.log(`[ElevenLabs] IVC enabled: ${data.can_use_instant_voice_cloning}`);

    expect(data).toHaveProperty("tier");
    expect(data).toHaveProperty("character_count");
    expect(data).toHaveProperty("character_limit");
  });
});
