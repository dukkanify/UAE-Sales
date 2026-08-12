import { getAppUrl } from "@/shared/constants/site";

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripeCurrency(): string {
  return (process.env.STRIPE_CURRENCY ?? "aed").toLowerCase();
}

export function getStripeSecretKey(): string | undefined {
  return process.env.STRIPE_SECRET_KEY?.trim();
}

export function getStripeWebhookSecret(): string | undefined {
  return process.env.STRIPE_WEBHOOK_SECRET?.trim();
}

export function getStripePublishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim();
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
