type DatabaseSource =
  | "DATABASE_URL"
  | "DATABASE_URL_UNPOOLED"
  | "POSTGRES_URL"
  | "POSTGRES_PRISMA_URL"
  | "DATABASE_PGHOST"
  | "none";

export type ProductionConfigSnapshot = {
  nodeEnv: string;
  databaseConfigured: boolean;
  databaseSource: DatabaseSource;
  resendConfigured: boolean;
  resendKeySource: string | null;
  emailProvider: string;
  emailFromAddress: string | null;
  emailFromName: string | null;
  appUrl: string | null;
  demoOtpServerEnabled: boolean;
  demoOtpClientEnabled: boolean;
  missing: string[];
};

/** Vercel Resend integration stores the key as RESEND_API_KEY. Aliases are read-only fallbacks. */
const RESEND_KEY_CANDIDATES = [
  "RESEND_API_KEY",
  "RESEND_API_TOKEN",
  "RESEND_TOKEN",
  "EMAIL_RESEND_API_KEY",
] as const;

export function resolveResendApiKey(): { source: string | null; value: string } {
  for (const name of RESEND_KEY_CANDIDATES) {
    const value = process.env[name]?.trim() ?? "";
    if (value) return { source: name, value };
  }
  return { source: null, value: "" };
}

function detectDatabaseSource(): { configured: boolean; source: DatabaseSource } {
  if (process.env.DATABASE_URL?.trim()) {
    return { configured: true, source: "DATABASE_URL" };
  }
  if (process.env.DATABASE_URL_UNPOOLED?.trim()) {
    return { configured: true, source: "DATABASE_URL_UNPOOLED" };
  }
  if (process.env.POSTGRES_URL?.trim()) {
    return { configured: true, source: "POSTGRES_URL" };
  }
  if (process.env.POSTGRES_PRISMA_URL?.trim()) {
    return { configured: true, source: "POSTGRES_PRISMA_URL" };
  }

  const host =
    process.env.DATABASE_PGHOST?.trim() ||
    process.env.DATABASE_PGHOST_UNPOOLED?.trim() ||
    process.env.PGHOST?.trim() ||
    "";
  const password =
    process.env.DATABASE_PGPASSWORD?.trim() ||
    process.env.PGPASSWORD?.trim() ||
    "";

  if (host && password) {
    return { configured: true, source: "DATABASE_PGHOST" };
  }

  return { configured: false, source: "none" };
}

export function getProductionConfigSnapshot(): ProductionConfigSnapshot {
  const database = detectDatabaseSource();
  const resendKey = resolveResendApiKey();
  const resendConfigured = Boolean(resendKey.value);
  const emailProvider = (process.env.EMAIL_PROVIDER ?? "resend").trim().toLowerCase();
  const emailFromAddress = process.env.EMAIL_FROM_ADDRESS?.trim() || null;
  const emailFromName = process.env.EMAIL_FROM_NAME?.trim() || null;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || null;
  const demoOtpServerEnabled = process.env.ENABLE_DEMO_OTP === "true";
  const demoOtpClientEnabled = process.env.NEXT_PUBLIC_ENABLE_DEMO_OTP === "true";

  const missing: string[] = [];
  if (!database.configured) {
    missing.push("DATABASE_URL");
  }
  if (!resendConfigured) {
    missing.push("RESEND_API_KEY");
  }
  if (!emailFromAddress) {
    missing.push("EMAIL_FROM_ADDRESS");
  }
  if (!appUrl) {
    missing.push("NEXT_PUBLIC_APP_URL");
  }
  if (emailProvider && emailProvider !== "resend") {
    missing.push("EMAIL_PROVIDER=resend");
  }
  if (process.env.NODE_ENV === "production" && demoOtpServerEnabled) {
    missing.push("ENABLE_DEMO_OTP=false");
  }
  if (process.env.NODE_ENV === "production" && demoOtpClientEnabled) {
    missing.push("NEXT_PUBLIC_ENABLE_DEMO_OTP=false");
  }

  return {
    nodeEnv: process.env.NODE_ENV ?? "development",
    databaseConfigured: database.configured,
    databaseSource: database.source,
    resendConfigured,
    resendKeySource: resendKey.source,
    emailProvider,
    emailFromAddress,
    emailFromName,
    appUrl,
    demoOtpServerEnabled,
    demoOtpClientEnabled,
    missing,
  };
}

let configLogged = false;

/** Logs missing production configuration once per process (names only, never secrets). */
export function logProductionConfigIssues(context?: string): ProductionConfigSnapshot {
  const snapshot = getProductionConfigSnapshot();

  if (process.env.NODE_ENV !== "production") {
    return snapshot;
  }

  if (snapshot.missing.length > 0) {
    console.error("[Sooqna Auth] production configuration incomplete", {
      context: context ?? "startup",
      missing: snapshot.missing,
      databaseConfigured: snapshot.databaseConfigured,
      databaseSource: snapshot.databaseSource,
      resendConfigured: snapshot.resendConfigured,
      resendKeySource: snapshot.resendKeySource,
      emailProvider: snapshot.emailProvider,
      emailFromAddress: snapshot.emailFromAddress,
      appUrl: snapshot.appUrl,
    });
    return snapshot;
  }

  if (!configLogged) {
    console.info("[Sooqna Auth] production configuration ok", {
      databaseSource: snapshot.databaseSource,
      resendConfigured: snapshot.resendConfigured,
      resendKeySource: snapshot.resendKeySource,
      emailProvider: snapshot.emailProvider,
      emailFromAddress: snapshot.emailFromAddress,
      appUrl: snapshot.appUrl,
    });
    configLogged = true;
  }

  return snapshot;
}
