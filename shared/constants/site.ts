const PRODUCTION_SITE_URL = "https://sooqna.site";
const DEVELOPMENT_SITE_URL = "http://localhost:3000";

function isLocalUrl(value: string): boolean {
  return /localhost|127\.0\.0\.1/i.test(value);
}

/** Canonical public site URL — never localhost in production builds. */
export function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  const isProd =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production";

  if (isProd) {
    if (!configured || isLocalUrl(configured)) {
      return PRODUCTION_SITE_URL;
    }
    return configured;
  }

  if (configured) {
    return configured;
  }
  return DEVELOPMENT_SITE_URL;
}

/** Apex hostname without www, derived from app URL. */
export function getSiteDomain(): string {
  try {
    return new URL(getAppUrl()).hostname.replace(/^www\./, "");
  } catch {
    return "sooqna.site";
  }
}

export function getSiteOrigin(): string {
  return getAppUrl();
}

export function isProductionDeployment(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}
