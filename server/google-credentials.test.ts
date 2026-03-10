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

  it("should be able to construct a valid Google OAuth URL", async () => {
    const { getGoogleAuthUrl } = await import("./googleClassroom");
    const url = getGoogleAuthUrl("https://leaderacademy.school/admin/google-classroom");
    expect(url).toContain("accounts.google.com");
    expect(url).toContain("client_id=");
    expect(url).toContain("redirect_uri=");
    expect(url).toContain("scope=");
  });
});
