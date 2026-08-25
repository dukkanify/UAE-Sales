/**
 * Enterprise registration lifecycle.
 * Pending registration is stored until OTP verification — then user, prefs,
 * security settings, and activity logs are created atomically.
 */

import { ACCOUNT_STATUS } from "@/constants/account-status";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { ROLE_DASHBOARD, ROLES, type Role } from "@/constants/roles";
import { generateId, hashPassword } from "@/lib/security/crypto";
import { rateLimit } from "@/lib/security/rate-limit";
import type { ApiResponse, UserProfile } from "@/types";
import { normalizePhone, sanitizeEmail, sanitizeString } from "@/utils/sanitize";
import type { RegisterInput } from "@/utils/validation";
import { logActivity } from "@/services/auth/activity-log";
import {
  demoOtpEnabled,
  getOtpPolicy,
  issueAndSendOtp,
  matchOtpCode,
  resendOtp,
} from "@/services/auth/otp-service";
import {
  defaultNotificationPreferences,
  defaultSecuritySettings,
  findPendingRegistrationByEmail,
  findPendingRegistrationById,
  findUserByEmail,
  findUserByPhone,
  isStudentProfileComplete,
  readAuthDb,
  toUserProfile,
  writeAuthDb,
  type OtpChallenge,
  type PendingRegistration,
  type StoredUser,
} from "@/services/auth/store";
import { dispatchRoleAlert, emailRegistrationWelcome } from "@/services/email/automation-service";
import { sendEmail } from "@/services/email/mailer";
import {
  accountCreatedEmailTemplate,
  verificationSuccessEmailTemplate,
} from "@/services/settings/email-templates";
import { getPlatformSettings } from "@/services/settings/settings-service";

export interface RegistrationRequestContext {
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceFingerprint?: string | null;
  deviceLabel?: string | null;
}

const PENDING_REGISTRATION_HOURS = 2;

function nowIso(): string {
  return new Date().toISOString();
}

function addHours(hours: number): string {
  return new Date(Date.now() + hours * 3_600_000).toISOString();
}

function defaultAvatarDataUri(initials: string): string {
  const safe =
    initials
      .replace(/[^A-Z]/gi, "")
      .slice(0, 2)
      .toUpperCase() || "AP";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="#143048"/><text x="64" y="74" text-anchor="middle" font-family="Arial,sans-serif" font-size="44" font-weight="700" fill="#F6C36C">${safe}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export async function startEnterpriseRegistration(
  input: RegisterInput,
  ctx?: RegistrationRequestContext,
): Promise<
  ApiResponse<{
    email: string;
    demoOtp?: string;
    expiresInMinutes: number;
    resendAvailableInSeconds: number;
    emailDelivery?: "smtp" | "outbox" | "failed";
  }>
> {
  const email = sanitizeEmail(input.email);
  const phone = normalizePhone(input.phone);

  const rl = rateLimit(`register:${email}`, 5, 15 * 60_000);
  if (!rl.allowed) {
    return {
      success: false,
      data: null,
      error: "Too many registration attempts. Please try again later.",
    };
  }

  if (findUserByEmail(email)) {
    return {
      success: false,
      data: null,
      error: "An account with this email already exists. Please sign in.",
    };
  }

  if (findUserByPhone(phone)) {
    return {
      success: false,
      data: null,
      error: "An account with this phone number already exists. Please sign in.",
    };
  }

  const pendingPhoneClash = readAuthDb().pendingRegistrations.find(
    (p) => normalizePhone(p.phone) === phone && new Date(p.expiresAt).getTime() > Date.now(),
  );
  if (pendingPhoneClash && pendingPhoneClash.email !== email) {
    return {
      success: false,
      data: null,
      error: "This phone number is already used on a pending registration.",
    };
  }

  const { hash, salt } = hashPassword(input.password);
  const role: Role = input.role === ROLES.INSTRUCTOR ? ROLES.INSTRUCTOR : ROLES.STUDENT;
  const pendingId = generateId();

  const pending: PendingRegistration = {
    id: pendingId,
    email,
    firstName: sanitizeString(input.firstName),
    lastName: sanitizeString(input.lastName),
    phone,
    countryCode: input.countryCode,
    nationality: sanitizeString(input.nationality),
    passwordHash: hash,
    passwordSalt: salt,
    role,
    acceptTermsAt: nowIso(),
    acceptPrivacyAt: nowIso(),
    marketingConsent: Boolean(input.marketingConsent),
    timezone: input.timezone || "UTC",
    language: input.language || "en",
    rememberMe: Boolean(input.rememberMe),
    expiresAt: addHours(PENDING_REGISTRATION_HOURS),
    createdAt: nowIso(),
  };

  writeAuthDb((db) => {
    db.pendingRegistrations = db.pendingRegistrations.filter(
      (p) => p.email.toLowerCase() !== email && new Date(p.expiresAt).getTime() > Date.now(),
    );
    db.pendingRegistrations.push(pending);
  });

  await logActivity({
    actorId: null,
    action: ACTIVITY_ACTIONS.REGISTRATION_STARTED,
    entityType: "registration",
    entityId: pendingId,
    metadata: { email, role, countryCode: pending.countryCode },
    ...ctx,
  });

  const issued = await issueAndSendOtp({
    email,
    purpose: "register",
    rememberMe: Boolean(input.rememberMe),
    pendingRegistrationId: pendingId,
    meta: {
      firstName: pending.firstName,
      lastName: pending.lastName,
      role,
      phone,
    },
    failClosed: true,
    ctx,
  });

  if (!issued.success || !issued.data) {
    writeAuthDb((db) => {
      db.pendingRegistrations = db.pendingRegistrations.filter((p) => p.id !== pendingId);
    });
    await logActivity({
      actorId: null,
      action: ACTIVITY_ACTIONS.REGISTRATION_CANCELLED,
      entityType: "registration",
      entityId: pendingId,
      metadata: { email, reason: "otp_email_failed" },
      ...ctx,
    });
    return {
      success: false,
      data: null,
      error: issued.error ?? "We could not send the verification email. Please try again.",
    };
  }

  return {
    success: true,
    data: {
      email,
      expiresInMinutes: issued.data.expiresInMinutes,
      resendAvailableInSeconds: issued.data.resendAvailableInSeconds,
      emailDelivery: issued.data.emailDelivery,
      ...(issued.data.demoOtp ? { demoOtp: issued.data.demoOtp } : {}),
    },
    error: null,
  };
}

export async function resendRegistrationOtp(
  emailRaw: string,
  ctx?: RegistrationRequestContext,
): Promise<
  ApiResponse<{
    email: string;
    demoOtp?: string;
    expiresInMinutes: number;
    resendAvailableInSeconds: number;
  }>
> {
  const email = sanitizeEmail(emailRaw);
  const pending = findPendingRegistrationByEmail(email);
  if (!pending) {
    return {
      success: false,
      data: null,
      error: "No pending registration found. Please start registration again.",
    };
  }

  const issued = await resendOtp({
    email,
    purpose: "register",
    rememberMe: pending.rememberMe,
    pendingRegistrationId: pending.id,
    meta: {
      firstName: pending.firstName,
      lastName: pending.lastName,
      role: pending.role,
      phone: pending.phone,
    },
    failClosed: true,
    requireExisting: true,
    ctx,
  });

  if (!issued.success || !issued.data) {
    return { success: false, data: null, error: issued.error };
  }

  return {
    success: true,
    data: {
      email,
      expiresInMinutes: issued.data.expiresInMinutes,
      resendAvailableInSeconds: issued.data.resendAvailableInSeconds,
      ...(issued.data.demoOtp ? { demoOtp: issued.data.demoOtp } : {}),
    },
    error: null,
  };
}

/** @deprecated Prefer matchOtpCode from otp-service — kept for test compatibility. */
export function matchRegistrationOtp(codeHash: string, token: string): boolean {
  return matchOtpCode(codeHash, token);
}

export async function finalizeEnterpriseRegistration(input: {
  email: string;
  challenge: OtpChallenge;
  ctx?: RegistrationRequestContext;
  issueSession: (
    user: StoredUser,
    rememberMe: boolean,
    ctx: RegistrationRequestContext,
  ) => Promise<{ profile: UserProfile; expiresAt: string }>;
}): Promise<
  ApiResponse<{
    user: UserProfile;
    redirectTo: string;
    requiresProfile: boolean;
  }>
> {
  const email = sanitizeEmail(input.email);
  const pendingId = input.challenge.pendingRegistrationId;
  const pending =
    (pendingId ? findPendingRegistrationById(pendingId) : null) ??
    findPendingRegistrationByEmail(email);

  if (!pending) {
    return {
      success: false,
      data: null,
      error: "Registration session expired. Please register again.",
    };
  }

  if (findUserByEmail(email) || findUserByPhone(pending.phone)) {
    writeAuthDb((db) => {
      db.pendingRegistrations = db.pendingRegistrations.filter((p) => p.id !== pending.id);
      db.otps = db.otps.filter((o) => o.id !== input.challenge.id);
    });
    return {
      success: false,
      data: null,
      error: "An account already exists for this email or phone. Please sign in.",
    };
  }

  const approvalRequired = Boolean(getPlatformSettings().users.instructorApprovalRequired);
  const status =
    pending.role === ROLES.INSTRUCTOR && approvalRequired
      ? ACCOUNT_STATUS.PENDING
      : ACCOUNT_STATUS.ACTIVE;

  const ts = nowIso();
  const initials = `${pending.firstName[0] ?? ""}${pending.lastName[0] ?? ""}`;
  const created: StoredUser = {
    id: generateId(),
    email: pending.email,
    firstName: pending.firstName,
    lastName: pending.lastName,
    phone: pending.phone,
    countryCode: pending.countryCode === "OTHER" ? null : pending.countryCode,
    nationality: pending.nationality,
    dateOfBirth: null,
    gender: null,
    city: null,
    bio: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    avatarUrl: defaultAvatarDataUri(initials),
    timezone: pending.timezone || "UTC",
    language: pending.language || "en",
    role: pending.role,
    status,
    emailVerified: true,
    profileComplete: false,
    passwordHash: pending.passwordHash,
    passwordSalt: pending.passwordSalt,
    lastLoginAt: null,
    createdAt: ts,
    updatedAt: ts,
  };
  created.profileComplete = isStudentProfileComplete(created);

  const prefs = defaultNotificationPreferences(created.id, pending.marketingConsent);
  const security = defaultSecuritySettings(created.id);

  writeAuthDb((db) => {
    if (
      db.users.some(
        (u) =>
          u.email.toLowerCase() === email || (u.phone && normalizePhone(u.phone) === pending.phone),
      )
    ) {
      throw new Error("DUPLICATE_IDENTITY");
    }
    db.users.push(created);
    db.notificationPreferences = db.notificationPreferences.filter((p) => p.userId !== created.id);
    db.notificationPreferences.push(prefs);
    db.securitySettings = db.securitySettings.filter((s) => s.userId !== created.id);
    db.securitySettings.push(security);
    db.pendingRegistrations = db.pendingRegistrations.filter((p) => p.id !== pending.id);
    db.otps = db.otps.filter((o) => o.id !== input.challenge.id);
  });

  await logActivity({
    actorId: created.id,
    action: ACTIVITY_ACTIONS.OTP_VERIFIED,
    entityType: "otp",
    entityId: input.challenge.id,
    metadata: { email, purpose: "register" },
    ...input.ctx,
  });
  await logActivity({
    actorId: created.id,
    action: ACTIVITY_ACTIONS.USER_CREATED,
    entityType: "user",
    entityId: created.id,
    metadata: { email, role: created.role, status: created.status },
    ...input.ctx,
  });
  await logActivity({
    actorId: created.id,
    action: ACTIVITY_ACTIONS.PROFILE_CREATED,
    entityType: "profile",
    entityId: created.id,
    metadata: { countryCode: created.countryCode, nationality: created.nationality },
    ...input.ctx,
  });
  await logActivity({
    actorId: created.id,
    action: ACTIVITY_ACTIONS.EMAIL_VERIFIED,
    entityType: "user",
    entityId: created.id,
    ...input.ctx,
  });
  await logActivity({
    actorId: created.id,
    action: ACTIVITY_ACTIONS.NOTIFICATION_PREFS_CREATED,
    entityType: "notification_prefs",
    entityId: created.id,
    metadata: { marketingConsent: pending.marketingConsent },
    ...input.ctx,
  });
  await logActivity({
    actorId: created.id,
    action: ACTIVITY_ACTIONS.SECURITY_SETTINGS_CREATED,
    entityType: "security_settings",
    entityId: created.id,
    ...input.ctx,
  });

  await emailRegistrationWelcome({ userId: created.id, actorId: created.id });

  const { emitNotification, notifyRole } =
    await import("@/services/notifications/notification-service");
  await emitNotification({
    userId: created.id,
    type: "account.created",
    title: "Account created",
    body: "Welcome to ATPL PASS — your account is ready.",
    actionUrl: "/complete-profile",
    email: false,
  });
  await emitNotification({
    userId: created.id,
    type: "account.welcome",
    title: "Welcome aboard",
    body: "Your ATPL PASS account is ready. Open your dashboard to continue.",
    email: false,
  });
  await notifyRole("admin", {
    title: "New registration",
    body: `${created.email} joined as ${created.role}.`,
    type: "admin.registration",
    data: { userId: created.id, email: created.email, role: created.role },
  });
  await notifyRole("super_admin", {
    title: "New registration",
    body: `${created.email} joined as ${created.role}.`,
    type: "admin.registration",
    data: { userId: created.id, email: created.email, role: created.role },
  });

  const verifiedTpl = verificationSuccessEmailTemplate({
    firstName: created.firstName || "Aviator",
    role: created.role,
  });
  await sendEmail({
    to: created.email,
    subject: verifiedTpl.subject,
    html: verifiedTpl.html,
    text: verifiedTpl.text,
    meta: { kind: "otp", purpose: "verification_success", system: true, userId: created.id },
  });

  const createdTpl = accountCreatedEmailTemplate({ firstName: created.firstName || "Aviator" });
  await sendEmail({
    to: created.email,
    subject: createdTpl.subject,
    html: createdTpl.html,
    text: createdTpl.text,
    meta: { kind: "otp", purpose: "account_created", system: true, userId: created.id },
  });

  const staff = readAuthDb()
    .users.filter(
      (u) =>
        (u.role === ROLES.SUPER_ADMIN || u.role === ROLES.ADMIN) &&
        u.status === ACCOUNT_STATUS.ACTIVE,
    )
    .map((u) => u.id);
  await dispatchRoleAlert({
    event: "admin_alert",
    title:
      created.role === ROLES.INSTRUCTOR ? "New instructor registered" : "New student registered",
    detail: `${created.email} created an AviatorPass ${created.role} account.`,
    reference: created.id,
    actorId: created.id,
    userIds: staff,
    system: true,
  });

  const { profile } = await input.issueSession(created, pending.rememberMe, input.ctx ?? {});

  await logActivity({
    actorId: profile.id,
    action: ACTIVITY_ACTIONS.LOGIN,
    entityType: "session",
    entityId: profile.id,
    metadata: { rememberMe: pending.rememberMe, via: "registration" },
    ...input.ctx,
  });

  const redirectTo =
    profile.role === ROLES.INSTRUCTOR && profile.status === ACCOUNT_STATUS.PENDING
      ? "/instructor-pending"
      : profile.profileComplete
        ? ROLE_DASHBOARD[profile.role]
        : "/complete-profile";

  return {
    success: true,
    data: {
      user: profile,
      redirectTo,
      requiresProfile: !profile.profileComplete,
    },
    error: null,
  };
}

export { demoOtpEnabled, getOtpPolicy, matchOtpCode, toUserProfile };
