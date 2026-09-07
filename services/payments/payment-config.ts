import { getAppUrl } from "@/shared/constants/site";
import {
  getCachedStripeCredentials,
  loadStripeCredentials,
  type StripeCredentialSource,
} from "@/services/payments/stripe-credentials-store";

export type ResolvedStripeConfig = {
  secretKey?: string;
  publishableKey?: string;
  webhookSecret?: string;
  source: StripeCredentialSource;
  updatedAt?: string;
};

function fromEnv(): ResolvedStripeConfig {
  return {
    secretKey: process.env.STRIPE_SECRET_KEY?.trim() || undefined,
    publishableKey:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || undefined,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET?.trim() || undefined,
    source: "env",
  };
}

function fromCacheOrEnv(): ResolvedStripeConfig {
  const cached = getCachedStripeCredentials();
  if (cached) {
    return {
      secretKey: process.env.STRIPE_SECRET_KEY?.trim() || cached.secretKey,
      publishableKey:
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ||
        cached.publishableKey,
      webhookSecret:
        process.env.STRIPE_WEBHOOK_SECRET?.trim() || cached.webhookSecret,
      source: process.env.STRIPE_SECRET_KEY?.trim()
        ? "env"
        : cached.secretKey
          ? cached.source
          : cached.source,
      updatedAt: cached.updatedAt,
    };
  }
  const env = fromEnv();
  return {
    ...env,
    source: env.secretKey || env.publishableKey || env.webhookSecret ? "env" : "none",
  };
}

/** Hydrate admin-stored Stripe keys (Postgres) when env vars are missing. */
export async function ensureStripeConfigLoaded(
  force = false,
): Promise<ResolvedStripeConfig> {
  const envSecret = process.env.STRIPE_SECRET_KEY?.trim();
  if (envSecret && !force) {
    return {
      secretKey: envSecret,
      publishableKey:
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || undefined,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET?.trim() || undefined,
      source: "env",
    };
  }
  const loaded = await loadStripeCredentials(force);
  return {
    secretKey: process.env.STRIPE_SECRET_KEY?.trim() || loaded.secretKey,
    publishableKey:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ||
      loaded.publishableKey,
    webhookSecret:
      process.env.STRIPE_WEBHOOK_SECRET?.trim() || loaded.webhookSecret,
    source: process.env.STRIPE_SECRET_KEY?.trim()
      ? "env"
      : loaded.secretKey
        ? "admin"
        : loaded.source,
    updatedAt: loaded.updatedAt,
  };
}

export function isStripeConfigured(): boolean {
  return Boolean(fromCacheOrEnv().secretKey);
}

export function getStripeCurrency(): string {
  return (process.env.STRIPE_CURRENCY ?? "aed").toLowerCase();
}

export function getStripeSecretKey(): string | undefined {
  return fromCacheOrEnv().secretKey;
}

export function getStripeWebhookSecret(): string | undefined {
  return fromCacheOrEnv().webhookSecret;
}

export function getStripePublishableKey(): string | undefined {
  return fromCacheOrEnv().publishableKey;
}

export function isStripeWebhookConfigured(): boolean {
  return Boolean(getStripeWebhookSecret());
}

/** True when running a production-like deployment (live Vercel or NODE_ENV=production). */
export function isProductionLike(): boolean {
  if (process.env.VERCEL_ENV === "production") return true;
  if (process.env.VERCEL_ENV === "preview") return false;
  return process.env.NODE_ENV === "production";
}

/**
 * Server-side guard for forced/automatic mock checkout.
 * Never allow silent mock on production-like hosts unless ALLOW_MOCK_CHECKOUT=true
 * (emergency/preview only — do not set on sooqna.site).
 */
export function isMockCheckoutAllowed(): boolean {
  if (process.env.ALLOW_MOCK_CHECKOUT === "true") return true;
  if (process.env.VERCEL_ENV === "preview") return true;
  if (isProductionLike()) return false;
  return process.env.NODE_ENV !== "production";
}

/** Re-export for payment redirects (Stripe success/cancel URLs). */
export { getAppUrl };
