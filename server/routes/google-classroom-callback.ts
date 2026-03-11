/**
 * Server-side Google Classroom OAuth callback route
 * Handles the OAuth code exchange directly on the server to avoid frontend race conditions
 */
import type { Express, Request, Response } from "express";
import { eq, and } from "drizzle-orm";
import { sdk } from "../_core/sdk";
import { getDb } from "../db";
import { googleClassroomConnections } from "../../drizzle/schema";

export function registerGoogleClassroomRoutes(app: Express) {
  // Server-side callback for Google OAuth
  app.get("/api/google-classroom/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : undefined;
    const stateParam = typeof req.query.state === "string" ? req.query.state : undefined;
    const error = typeof req.query.error === "string" ? req.query.error : undefined;

    console.log("[Google Classroom] OAuth callback received", {
      hasCode: !!code,
      hasState: !!stateParam,
      hasError: !!error,
      error: error || "none",
    });

    // Determine the frontend URL to redirect to
    // Use the origin from the state parameter, or fall back to request headers
    let frontendOrigin = "";
    let userId: number | null = null;

    if (stateParam) {
      try {
        const stateData = JSON.parse(stateParam);
        frontendOrigin = stateData.origin || "";
        userId = stateData.userId || null;
      } catch (e) {
        console.error("[Google Classroom] Failed to parse state:", e);
      }
    }

    // Fall back to request origin
    if (!frontendOrigin) {
      const proto = req.headers["x-forwarded-proto"] || req.protocol || "https";
      const host = req.headers["x-forwarded-host"] || req.headers.host || "";
      frontendOrigin = `${proto}://${host}`;
    }

    const redirectBase = `${frontendOrigin}/admin/google-classroom`;

    // Handle errors from Google
    if (error) {
      console.error("[Google Classroom] OAuth error from Google:", error);
      res.redirect(302, `${redirectBase}?gc_error=${encodeURIComponent(error)}`);
      return;
    }

    if (!code) {
      console.error("[Google Classroom] No code in callback");
      res.redirect(302, `${redirectBase}?gc_error=no_code`);
      return;
    }

    // Authenticate the user from session cookie
    let user;
    try {
      user = await sdk.authenticateRequest(req);
    } catch (authError) {
      console.error("[Google Classroom] User not authenticated:", authError);
      res.redirect(302, `${redirectBase}?gc_error=not_authenticated`);
      return;
    }

    if (user.role !== "admin") {
      console.error("[Google Classroom] User is not admin:", user.id);
      res.redirect(302, `${redirectBase}?gc_error=not_admin`);
      return;
    }

    // Exchange code for tokens
    try {
      const { exchangeCodeForTokens } = await import("../googleClassroom");
      
      // The redirect_uri must match exactly what was used in the auth URL
      const callbackUri = `${frontendOrigin}/api/google-classroom/callback`;
      
      console.log("[Google Classroom] Exchanging code for tokens with redirect_uri:", callbackUri);
      
      const tokens = await exchangeCodeForTokens(code, callbackUri);
      
      console.log("[Google Classroom] Token exchange successful, email:", tokens.email);

      // Save to database
      const database = await getDb();
      if (!database) {
        console.error("[Google Classroom] Database not available");
        res.redirect(302, `${redirectBase}?gc_error=db_error`);
        return;
      }

      // Deactivate old connections
      await database.update(googleClassroomConnections)
        .set({ isActive: false })
        .where(eq(googleClassroomConnections.userId, user.id));

      // Create new connection
      await database.insert(googleClassroomConnections).values({
        userId: user.id,
        googleEmail: tokens.email,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
        scopes: tokens.scopes,
        isActive: true,
      });

      console.log("[Google Classroom] Connection saved successfully for user:", user.id);
      
      // Redirect to success page
      res.redirect(302, `${redirectBase}?gc_success=true&gc_email=${encodeURIComponent(tokens.email)}`);
    } catch (tokenError: any) {
      console.error("[Google Classroom] Token exchange failed:", tokenError.message || tokenError);
      res.redirect(302, `${redirectBase}?gc_error=${encodeURIComponent(tokenError.message || "token_exchange_failed")}`);
    }
  });
}
