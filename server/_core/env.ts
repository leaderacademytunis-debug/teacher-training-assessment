export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // SMTP Configuration
  SMTP_HOST: process.env.SMTP_HOST ?? "",
  SMTP_PORT: parseInt(process.env.SMTP_PORT ?? "587"),
  SMTP_SECURE: process.env.SMTP_SECURE ?? "false",
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: process.env.SMTP_PASS ?? "",
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME ?? "منصة تأهيل المدu0631سين",
  VITE_APP_URL: process.env.VITE_APP_URL ?? "",
};
