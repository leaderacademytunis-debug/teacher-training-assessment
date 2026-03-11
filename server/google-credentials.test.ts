import { describe, it, expect } from "vitest";

describe("Google Classroom Credentials Validation", () => {
  it("should have GOOGLE_CLIENT_ID set in environment", () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    expect(clientId).toBeDefined();
    expect(clientId).not.toBe("");
    expect(clientId).toContain(".apps.googleusercontent.com");
  });

  it("should have GOOGLE_CLIENT_SECRET set in environment", () => {
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    expect(clientSecret).toBeDefined();
    expect(clientSecret).not.toBe("");
    expect(clientSecret).toContain("GOCSPX-");
  });

  it("should be able to construct a valid Google OAuth URL with server callback", async () => {
    const { getGoogleAuthUrl } = await import("./googleClassroom");
    const state = JSON.stringify({ userId: 1, origin: "https://leaderacademy.school" });
    const callbackUri = "https://leaderacademy.school/api/auth/callback/google";
    const url = getGoogleAuthUrl(state, callbackUri);
    expect(url).toContain("accounts.google.com");
    expect(url).toContain("client_id=");
    expect(url).toContain("redirect_uri=");
    expect(url).toContain("scope=");
    // Verify the redirect_uri points to the server callback
    expect(url).toContain(encodeURIComponent("/api/auth/callback/google"));
  });

  it("should include state parameter with origin in the auth URL", async () => {
    const { getGoogleAuthUrl } = await import("./googleClassroom");
    const state = JSON.stringify({ userId: 1, origin: "https://leaderacademy.school" });
    const callbackUri = "https://leaderacademy.school/api/auth/callback/google";
    const url = getGoogleAuthUrl(state, callbackUri);
    expect(url).toContain("state=");
    // The state should be URL-encoded JSON containing the origin
    const urlObj = new URL(url);
    const stateParam = urlObj.searchParams.get("state");
    expect(stateParam).toBeTruthy();
    const parsedState = JSON.parse(stateParam!);
    expect(parsedState.origin).toBe("https://leaderacademy.school");
    expect(parsedState.userId).toBe(1);
  });
});
