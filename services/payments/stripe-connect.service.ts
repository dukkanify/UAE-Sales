import Stripe from "stripe";
import type { UserProfile } from "@/types";
import { findUserById } from "@/services/auth/user-store";
import { sendTransactionalEmail } from "@/services/email/transactional-email";
import {
  emailSiteUrl,
  escapeEmailHtml,
} from "@/services/email/sooqna-email-template";
import { createNotification } from "@/services/payments/notification-store";
import { logPaymentEvent } from "@/services/payments/payment-log";
import {
  ensureStripeConfigLoaded,
  getAppUrl,
  isStripeConfigured,
} from "@/services/payments/payment-config";
import { getStripeClient } from "@/services/payments/stripe.service";
import {
  getConnectAccountByOwner,
  getConnectAccountByStripeId,
  type StripeConnectAccountRecord,
  type StripeConnectOnboardingStatus,
  upsertConnectAccount,
} from "@/services/payments/stripe-connect-store";
import { resolveEmailLocale } from "@/shared/i18n/email-locale";

export type StripeConnectPublicStatus = {
  status: StripeConnectOnboardingStatus;
  statusLabelAr: string;
  statusLabelEn: string;
  stripeAccountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsStatus: string;
  disabledReason: string | null;
  outstandingRequirements: string[];
  connectedAt: string | null;
  updatedAt: string | null;
  platformConfigured: boolean;
  shouldAutoRedirect: boolean;
  canOpenDashboard: boolean;
};

const STATUS_LABELS: Record<
  StripeConnectOnboardingStatus,
  { ar: string; en: string }
> = {
  NOT_CONNECTED: { ar: "غير متصل", en: "Not connected" },
  SETUP_REQUIRED: { ar: "إكمال إعداد Stripe", en: "Complete Stripe setup" },
  UNDER_VERIFICATION: {
    ar: "قيد التحقق من Stripe",
    en: "Under Stripe review",
  },
  REQUIREMENTS_DUE: {
    ar: "معلومات إضافية مطلوبة",
    en: "Additional information required",
  },
  ACTIVE: { ar: "Stripe متصل ومفعّل", en: "Stripe connected and active" },
  RESTRICTED: { ar: "مقيد", en: "Restricted" },
};

export function connectStatusLabels(
  status: StripeConnectOnboardingStatus,
): { ar: string; en: string } {
  return STATUS_LABELS[status];
}

export function mapStripeAccountToStatus(
  account: Stripe.Account,
): StripeConnectOnboardingStatus {
  const currentlyDue = account.requirements?.currently_due ?? [];
  const pastDue = account.requirements?.past_due ?? [];
  const pendingVerification = account.requirements?.pending_verification ?? [];
  const disabledReason = account.requirements?.disabled_reason ?? null;

  if (disabledReason) {
    return "RESTRICTED";
  }

  if (currentlyDue.length > 0 || pastDue.length > 0) {
    return "REQUIREMENTS_DUE";
  }

  if (
    account.charges_enabled &&
    account.payouts_enabled &&
    account.details_submitted
  ) {
    return "ACTIVE";
  }

  if (account.details_submitted && pendingVerification.length > 0) {
    return "UNDER_VERIFICATION";
  }

  if (!account.details_submitted) {
    return "SETUP_REQUIRED";
  }

  if (!account.charges_enabled || !account.payouts_enabled) {
    return pendingVerification.length > 0
      ? "UNDER_VERIFICATION"
      : "SETUP_REQUIRED";
  }

  return "SETUP_REQUIRED";
}

function requirementsSummary(account: Stripe.Account): {
  status: string;
  outstanding: string[];
  disabledReason: string | null;
} {
  const currentlyDue = account.requirements?.currently_due ?? [];
  const pastDue = account.requirements?.past_due ?? [];
  const pendingVerification = account.requirements?.pending_verification ?? [];
  const outstanding = [...new Set([...currentlyDue, ...pastDue])];
  const disabledReason = account.requirements?.disabled_reason ?? null;

  let status = "none";
  if (disabledReason) status = `disabled:${disabledReason}`;
  else if (outstanding.length > 0) status = `due:${outstanding.length}`;
  else if (pendingVerification.length > 0) {
    status = `pending_verification:${pendingVerification.length}`;
  } else if (account.details_submitted) status = "submitted";
  else status = "incomplete";

  return { status, outstanding, disabledReason };
}

function toPublicStatus(
  record: StripeConnectAccountRecord | null,
  platformConfigured: boolean,
): StripeConnectPublicStatus {
  if (!record) {
    const labels = STATUS_LABELS.NOT_CONNECTED;
    return {
      status: "NOT_CONNECTED",
      statusLabelAr: labels.ar,
      statusLabelEn: labels.en,
      stripeAccountId: null,
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
      requirementsStatus: "",
      disabledReason: null,
      outstandingRequirements: [],
      connectedAt: null,
      updatedAt: null,
      platformConfigured,
      shouldAutoRedirect: platformConfigured,
      canOpenDashboard: false,
    };
  }

  const labels = STATUS_LABELS[record.stripeOnboardingStatus];
  // Auto-redirect only for first-time connect (NOT_CONNECTED). Incomplete
  // setup / requirements use explicit CTAs so admins are not surprise-redirected.
  const shouldAutoRedirect =
    platformConfigured && record.stripeOnboardingStatus === "NOT_CONNECTED";

  return {
    status: record.stripeOnboardingStatus,
    statusLabelAr: labels.ar,
    statusLabelEn: labels.en,
    stripeAccountId: record.stripeAccountId,
    chargesEnabled: record.stripeChargesEnabled,
    payoutsEnabled: record.stripePayoutsEnabled,
    detailsSubmitted: record.stripeDetailsSubmitted,
    requirementsStatus: record.stripeRequirementsStatus,
    disabledReason: record.stripeDisabledReason,
    outstandingRequirements: record.outstandingRequirements,
    connectedAt: record.stripeConnectedAt,
    updatedAt: record.stripeUpdatedAt,
    platformConfigured,
    shouldAutoRedirect,
    canOpenDashboard:
      record.stripeDetailsSubmitted &&
      record.stripeOnboardingStatus !== "NOT_CONNECTED",
  };
}

function buildRecordFromAccount(input: {
  ownerUserId: string;
  account: Stripe.Account;
  previous?: StripeConnectAccountRecord | null;
}): StripeConnectAccountRecord {
  const now = new Date().toISOString();
  const summary = requirementsSummary(input.account);
  return {
    ownerUserId: input.ownerUserId,
    stripeAccountId: input.account.id,
    stripeOnboardingStatus: mapStripeAccountToStatus(input.account),
    stripeChargesEnabled: Boolean(input.account.charges_enabled),
    stripePayoutsEnabled: Boolean(input.account.payouts_enabled),
    stripeDetailsSubmitted: Boolean(input.account.details_submitted),
    stripeRequirementsStatus: summary.status,
    stripeDisabledReason: summary.disabledReason,
    stripeConnectedAt: input.previous?.stripeConnectedAt ?? now,
    stripeUpdatedAt: now,
    outstandingRequirements: summary.outstanding,
  };
}

async function notifyConnectStatusChange(
  previous: StripeConnectAccountRecord | null,
  next: StripeConnectAccountRecord,
): Promise<void> {
  if (previous?.stripeOnboardingStatus === next.stripeOnboardingStatus) {
    return;
  }

  const labels = STATUS_LABELS[next.stripeOnboardingStatus];
  const activated = next.stripeOnboardingStatus === "ACTIVE";
  const needsInfo =
    next.stripeOnboardingStatus === "REQUIREMENTS_DUE" ||
    next.stripeOnboardingStatus === "SETUP_REQUIRED";

  const title = activated
    ? "تم تفعيل حساب Stripe"
    : needsInfo
      ? "يحتاج Stripe إلى معلومات إضافية"
      : `تحديث حالة Stripe: ${labels.ar}`;
  const titleEn = activated
    ? "Stripe account activated"
    : needsInfo
      ? "Stripe needs additional information"
      : `Stripe status update: ${labels.en}`;
  const body = activated
    ? "تم تفعيل حساب Stripe الخاص بك بنجاح."
    : needsInfo
      ? "يحتاج Stripe إلى معلومات إضافية لإكمال التحقق."
      : `حالة ربط Stripe الآن: ${labels.ar}.`;
  const bodyEn = activated
    ? "Your Stripe account was activated successfully."
    : needsInfo
      ? "Stripe needs additional information to complete verification."
      : `Your Stripe connection status is now: ${labels.en}.`;

  await createNotification({
    userId: next.ownerUserId,
    type: activated ? "stripe_active" : "stripe_requirements",
    title,
    titleEn,
    body,
    bodyEn,
    href: "/admin/stripe",
  });

  const user = await findUserById(next.ownerUserId);
  if (!user?.email) return;

  const locale = await resolveEmailLocale({
    userId: user.id,
    email: user.email,
  });
  const english = locale === "en";
  await sendTransactionalEmail({
    type: activated ? "stripe_active" : "stripe_requirements",
    to: user.email,
    userId: user.id,
    entityId: `${next.stripeAccountId}:${next.stripeOnboardingStatus}`,
    locale,
    subject: english ? titleEn : title,
    title: english ? titleEn : title,
    bodyHtml: english
      ? `<p style="font-size:16px;line-height:1.8;margin:0;">${escapeEmailHtml(bodyEn)}</p>`
      : `<p style="font-size:16px;line-height:1.8;margin:0;">${escapeEmailHtml(body)}</p>`,
    bodyLines: [english ? bodyEn : body],
    ctaHref: emailSiteUrl("/admin/stripe"),
    ctaLabel: english ? "Open Stripe settings" : "فتح إعدادات Stripe",
    dedupeWindowMs: 6 * 60 * 60 * 1000,
  });
}

export async function getConnectStatusForUser(
  user: UserProfile,
  options?: { sync?: boolean },
): Promise<StripeConnectPublicStatus> {
  await ensureStripeConfigLoaded();
  const platformConfigured = isStripeConfigured();
  let record = await getConnectAccountByOwner(user.id);

  if (options?.sync && record && platformConfigured) {
    record = await syncConnectAccountFromStripe(user.id);
  }

  return toPublicStatus(record, platformConfigured);
}

export async function ensureConnectAccount(
  user: UserProfile,
): Promise<StripeConnectAccountRecord> {
  await ensureStripeConfigLoaded();
  if (!isStripeConfigured()) {
    throw new Error("STRIPE_NOT_CONFIGURED");
  }

  const existing = await getConnectAccountByOwner(user.id);
  if (existing?.stripeAccountId) {
    const stripe = await getStripeClient();
    const account = await stripe.accounts.retrieve(existing.stripeAccountId);
    const next = buildRecordFromAccount({
      ownerUserId: user.id,
      account,
      previous: existing,
    });
    await upsertConnectAccount(next);
    return next;
  }

  const stripe = await getStripeClient();
  const isCompany =
    user.accountType === "company" ||
    user.accountType === "business" ||
    Boolean(user.businessProfile?.businessName);

  const account = await stripe.accounts.create(
    {
      type: "express",
      country: "AE",
      email: user.email,
      business_type: isCompany ? "company" : "individual",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_profile: {
        name:
          user.businessProfile?.businessName?.trim() ||
          user.fullName?.trim() ||
          "Sooqna",
        product_description: "Sooqna marketplace — UAE classifieds",
        url: getAppUrl(),
      },
      metadata: {
        sooqnaUserId: user.id,
        platform: "sooqna",
        accountType: user.accountType,
      },
    },
    { idempotencyKey: `sooqna-connect-${user.id}` },
  );

  const record = buildRecordFromAccount({
    ownerUserId: user.id,
    account,
    previous: null,
  });
  await upsertConnectAccount(record);

  await logPaymentEvent({
    type: "connect.account.created",
    payload: {
      ownerUserId: user.id,
      stripeAccountId: account.id,
    },
  });

  return record;
}

export async function createConnectAccountLink(
  user: UserProfile,
): Promise<{ url: string; stripeAccountId: string }> {
  const record = await ensureConnectAccount(user);
  const stripe = await getStripeClient();
  const appUrl = getAppUrl();

  const link = await stripe.accountLinks.create({
    account: record.stripeAccountId,
    refresh_url: `${appUrl}/admin/stripe/refresh`,
    return_url: `${appUrl}/admin/stripe/return`,
    type: "account_onboarding",
  });

  if (!link.url) {
    throw new Error("ACCOUNT_LINK_MISSING");
  }

  await logPaymentEvent({
    type: "connect.account_link.created",
    payload: {
      ownerUserId: user.id,
      stripeAccountId: record.stripeAccountId,
    },
  });

  return { url: link.url, stripeAccountId: record.stripeAccountId };
}

export async function syncConnectAccountFromStripe(
  ownerUserId: string,
): Promise<StripeConnectAccountRecord | null> {
  await ensureStripeConfigLoaded();
  if (!isStripeConfigured()) {
    throw new Error("STRIPE_NOT_CONFIGURED");
  }

  const existing = await getConnectAccountByOwner(ownerUserId);
  if (!existing?.stripeAccountId) {
    return null;
  }

  const stripe = await getStripeClient();
  const account = await stripe.accounts.retrieve(existing.stripeAccountId);
  const next = buildRecordFromAccount({
    ownerUserId,
    account,
    previous: existing,
  });
  await upsertConnectAccount(next);
  await notifyConnectStatusChange(existing, next);

  await logPaymentEvent({
    type: "connect.account.synced",
    payload: {
      ownerUserId,
      stripeAccountId: next.stripeAccountId,
      status: next.stripeOnboardingStatus,
    },
  });

  return next;
}

export async function syncConnectAccountFromWebhook(
  account: Stripe.Account,
): Promise<StripeConnectAccountRecord | null> {
  const existing = await getConnectAccountByStripeId(account.id);
  if (!existing) {
    // Ignore accounts not created by Sooqna for this deployment.
    return null;
  }

  const ownerUserId =
    (typeof account.metadata?.sooqnaUserId === "string" &&
      account.metadata.sooqnaUserId) ||
    existing.ownerUserId;

  if (ownerUserId !== existing.ownerUserId) {
    // Never reassign ownership from webhook metadata alone.
  }

  const next = buildRecordFromAccount({
    ownerUserId: existing.ownerUserId,
    account,
    previous: existing,
  });
  await upsertConnectAccount(next);
  await notifyConnectStatusChange(existing, next);
  return next;
}

export async function createConnectExpressLoginLink(
  user: UserProfile,
): Promise<string> {
  const existing = await getConnectAccountByOwner(user.id);
  if (!existing?.stripeAccountId) {
    throw new Error("STRIPE_NOT_CONNECTED");
  }
  if (!existing.stripeDetailsSubmitted) {
    throw new Error("STRIPE_ONBOARDING_INCOMPLETE");
  }

  const stripe = await getStripeClient();
  const login = await stripe.accounts.createLoginLink(existing.stripeAccountId);
  if (!login.url) {
    throw new Error("LOGIN_LINK_MISSING");
  }
  return login.url;
}

export function assertConnectOwnership(
  record: StripeConnectAccountRecord | null,
  userId: string,
): boolean {
  if (!record) return true;
  return record.ownerUserId === userId;
}
