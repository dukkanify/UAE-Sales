/**
 * Seed integrations catalog + demo OAuth-ready client metadata.
 */

import { generateId, generateToken, hashValue } from "@/lib/security/crypto";
import { ensureApiPlatformStore, writeApiPlatformStore } from "@/services/api-platform/store";
import type { IntegrationSetting } from "@/types/api-platform";

const INTEGRATIONS: Array<Omit<IntegrationSetting, "id" | "updatedAt">> = [
  {
    provider: "zoom",
    label: "Zoom Meetings",
    enabled: true,
    status: process.env.ZOOM_CLIENT_ID ? "configured" : "mock",
    config: { scopes: ["meeting:write", "meeting:read"] },
    secretsPresent: Boolean(process.env.ZOOM_CLIENT_ID),
    notes: "Live class join URLs; webhook endpoint ready at /api/v1/webhooks/inbound/zoom",
  },
  {
    provider: "smtp",
    label: "SMTP / Email",
    enabled: true,
    status: "mock",
    config: { providers: ["smtp", "sendgrid", "mailgun", "ses", "resend"] },
    secretsPresent: false,
    notes: "Configure via Platform Settings → Email",
  },
  {
    provider: "stripe",
    label: "Stripe Payments",
    enabled: true,
    status: process.env.STRIPE_SECRET_KEY ? "configured" : "mock",
    config: { webhookPath: "/api/payments/webhooks" },
    secretsPresent: Boolean(process.env.STRIPE_SECRET_KEY),
    notes: "Checkout + Connect wallet payouts",
  },
  {
    provider: "google_calendar",
    label: "Google Calendar",
    enabled: false,
    status: "ready",
    config: { oauth: true, scopes: ["calendar.events"] },
    secretsPresent: false,
    notes: "Future — OAuth client placeholder",
  },
  {
    provider: "microsoft_calendar",
    label: "Microsoft Calendar",
    enabled: false,
    status: "ready",
    config: { oauth: true },
    secretsPresent: false,
    notes: "Future — Graph API placeholder",
  },
  {
    provider: "slack",
    label: "Slack",
    enabled: false,
    status: "ready",
    config: { events: ["notifications"] },
    secretsPresent: false,
    notes: "Future — incoming webhooks + bot",
  },
  {
    provider: "microsoft_teams",
    label: "Microsoft Teams",
    enabled: false,
    status: "ready",
    config: {},
    secretsPresent: false,
    notes: "Future — adaptive cards notifications",
  },
  {
    provider: "crm",
    label: "CRM Systems",
    enabled: false,
    status: "ready",
    config: { adapters: ["hubspot", "salesforce"] },
    secretsPresent: false,
    notes: "Future — lead sync",
  },
  {
    provider: "marketing",
    label: "Marketing Platforms",
    enabled: false,
    status: "ready",
    config: { adapters: ["mailchimp", "brevo"] },
    secretsPresent: false,
    notes: "Future — campaign sync",
  },
];

export function ensureApiPlatformSeeded() {
  const db = ensureApiPlatformStore();
  if (db.seeded) return db;

  const now = new Date().toISOString();
  db.integrations = INTEGRATIONS.map((i) => ({
    ...i,
    id: generateId(),
    updatedAt: now,
  }));

  const clientSecret = generateToken(24);
  db.oauthClients = [
    {
      id: generateId(),
      name: "AviatorPass Mobile (placeholder)",
      clientId: "aep_mobile_dev",
      clientSecretHash: hashValue(clientSecret),
      redirectUris: ["aep://oauth/callback", "http://localhost:8081/oauth"],
      createdAt: now,
    },
  ];

  db.seeded = true;
  writeApiPlatformStore(db);
  return db;
}
