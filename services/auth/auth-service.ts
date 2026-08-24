import { getServerEnv } from "@/config/env";
import { ACCOUNT_STATUS, AUTHENTICATABLE_STATUSES } from "@/constants/account-status";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { getPermissionsForRole, ROLE_DASHBOARD, ROLES, type Role } from "@/constants/roles";
import {
  clearSessionCookies,
  hashSessionToken,
  readSessionCookie,
  setSessionCookies,
} from "@/lib/security/cookies";
import {
  generateId,
  generateToken,
  hashPassword,
  hashValue,
  verifyPassword,
} from "@/lib/security/crypto";
import type { ApiResponse, UserProfile } from "@/types";
import { sanitizeEmail, sanitizeString } from "@/utils/sanitize";
import {
  findUserByEmail,
  findUserById,
  isStudentProfileComplete,
  readAuthDb,
  toUserProfile,
  writeAuthDb,
  type OtpChallenge,
  type StoredUser,
} from "@/services/auth/store";
import { logActivity } from "@/services/auth/activity-log";
import { ensureDemoUsersSeeded } from "@/services/auth/demo-users";
import { finalizeEnterpriseRegistration } from "@/services/auth/registration-service";
import {
  demoOtpEnabled,
  issueAndSendOtp,
  markOtpVerified,
  validateOtpToken,
} from "@/services/auth/otp-service";
import { ensureSuperAdminSeeded } from "@/services/auth/seed";
import {
  maxAllowedSessions,
  revokeExcessSessions,
  revokeSessionById,
} from "@/services/auth/session-service";
import { getPlatformSettings } from "@/services/settings/settings-service";
import { describeDeviceFromUserAgent } from "@/lib/security/device-fingerprint";

export interface RequestContext {
  ipAddress?: string | null;
  userAgent?: string | null;
  deviceFingerprint?: string | null;
  deviceLabel?: string | null;
}

function nowIso(): string {
  return new Date().toISOString();
}

function addMinutes(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function addDays(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

function createUser(partial: {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: Role;
  status?: StoredUser["status"];
}): StoredUser {
  const ts = nowIso();
  return {
    id: generateId(),
    email: sanitizeEmail(partial.email),
    firstName: partial.firstName ?? null,
    lastName: partial.lastName ?? null,
    phone: null,
    countryCode: null,
    nationality: null,
    dateOfBirth: null,
    gender: null,
    city: null,
    bio: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    avatarUrl: null,
    timezone: "UTC",
    language: "en",
    role: partial.role ?? ROLES.STUDENT,
    status: partial.status ?? ACCOUNT_STATUS.PENDING,
    emailVerified: false,
    profileComplete: false,
    passwordHash: null,
    passwordSalt: null,
    lastLoginAt: null,
    createdAt: ts,
    updatedAt: ts,
  };
}

async function issueSession(
  user: StoredUser,
  rememberMe: boolean,
  ctx: RequestContext,
): Promise<{ profile: UserProfile; expiresAt: string }> {
  const env = getServerEnv();
  const settings = getPlatformSettings();
  const days = rememberMe
    ? Math.max(1, Math.ceil(settings.authentication.rememberMeDays || env.AUTH_REMEMBER_ME_DAYS))
    : Math.max(
        1,
        Math.ceil(
          (settings.authentication.sessionTimeoutMinutes || env.AUTH_SESSION_DAYS * 24 * 60) /
            (60 * 24),
        ),
      );

  // Drop any prior browser identity first so admin → student/instructor switches cannot stick.
  const prior = await readSessionCookie();
  if (prior?.payload.sid) {
    revokeSessionById(prior.payload.sid);
  }

  const token = generateToken(32);
  const sessionId = generateId();
  const expiresAt = addDays(days);
  const fingerprintEnabled = settings.security.deviceFingerprintingEnabled;
  const deviceFingerprint =
    fingerprintEnabled && ctx.deviceFingerprint
      ? String(ctx.deviceFingerprint).slice(0, 128)
      : null;
  const deviceLabel = ctx.deviceLabel?.trim() || describeDeviceFromUserAgent(ctx.userAgent) || null;

  writeAuthDb((db) => {
    db.sessions.push({
      id: sessionId,
      userId: user.id,
      tokenHash: hashSessionToken(token),
      userAgent: ctx.userAgent ?? null,
      ipAddress: ctx.ipAddress ?? null,
      deviceFingerprint,
      deviceLabel,
      rememberMe,
      expiresAt,
      revokedAt: null,
      createdAt: nowIso(),
      lastActiveAt: nowIso(),
    });

    const target = db.users.find((u) => u.id === user.id);
    if (target) {
      target.profileComplete = isStudentProfileComplete(target);
      target.lastLoginAt = nowIso();
      target.updatedAt = nowIso();
    }
  });

  const keep = maxAllowedSessions(user.role);
  if (keep > 0) {
    const revoked = revokeExcessSessions({
      userId: user.id,
      keepSessionId: sessionId,
      keep,
      actorId: user.id,
    });
    if (revoked > 0) {
      await logActivity({
        actorId: user.id,
        action: ACTIVITY_ACTIONS.SESSION_REVOKED,
        entityType: "session",
        entityId: sessionId,
        metadata: {
          reason: "single_device_or_max_sessions",
          revoked,
          deviceFingerprint: deviceFingerprint ? deviceFingerprint.slice(0, 8) : null,
        },
        ipAddress: ctx.ipAddress,
        userAgent: ctx.userAgent,
      });
    }
  }

  const fresh = findUserById(user.id)!;
  await setSessionCookies(
    sessionId,
    token,
    {
      userId: fresh.id,
      role: fresh.role,
      status: fresh.status,
      profileComplete: fresh.profileComplete,
    },
    days * 86_400,
  );

  return { profile: toUserProfile(fresh), expiresAt };
}

export async function getCurrentSession(): Promise<{
  user: UserProfile | null;
  permissions: ReturnType<typeof getPermissionsForRole>;
}> {
  ensureSuperAdminSeeded();

  const parsed = await readSessionCookie();
  if (!parsed) {
    return { user: null, permissions: [] };
  }

  const db = readAuthDb();
  const session = db.sessions.find((s) => s.id === parsed.payload.sid);
  if (!session || session.revokedAt) {
    await clearSessionCookies();
    return { user: null, permissions: [] };
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    writeAuthDb((d) => {
      const s = d.sessions.find((x) => x.id === session.id);
      if (s) s.revokedAt = nowIso();
    });
    await clearSessionCookies();
    return { user: null, permissions: [] };
  }

  if (session.tokenHash !== hashSessionToken(parsed.rawToken)) {
    await clearSessionCookies();
    return { user: null, permissions: [] };
  }

  if (session.tokenHash !== parsed.payload.th) {
    await clearSessionCookies();
    return { user: null, permissions: [] };
  }

  const user = findUserById(session.userId);
  if (!user) {
    await clearSessionCookies();
    return { user: null, permissions: [] };
  }

  if (user.status === ACCOUNT_STATUS.SUSPENDED || user.status === ACCOUNT_STATUS.INACTIVE) {
    return { user: toUserProfile(user), permissions: [] };
  }

  writeAuthDb((d) => {
    const s = d.sessions.find((x) => x.id === session.id);
    if (s) s.lastActiveAt = nowIso();
  });

  return {
    user: toUserProfile(user),
    permissions: getPermissionsForRole(user.role),
  };
}

export async function requestOtp(input: {
  email: string;
  purpose: OtpChallenge["purpose"];
  rememberMe?: boolean;
  firstName?: string;
  lastName?: string;
  bookingId?: string;
  role?: Role;
  ctx?: RequestContext;
}): Promise<
  ApiResponse<{
    email: string;
    demoOtp?: string;
    expiresInMinutes: number;
    resendAvailableInSeconds?: number;
    emailDelivery?: "smtp" | "outbox" | "failed";
    emailOutboxId?: string;
  }>
> {
  ensureSuperAdminSeeded();
  // CI / local demo: ensure student.one etc. exist before login OTP.
  if (demoOtpEnabled()) ensureDemoUsersSeeded();

  const email = sanitizeEmail(input.email);
  const existing = findUserByEmail(email);

  if (input.purpose === "login" && !existing) {
    return {
      success: false,
      data: null,
      error: "No account found for this email. Please register first.",
    };
  }

  if (input.purpose === "register") {
    return {
      success: false,
      data: null,
      error: "Use the registration endpoint to create a new account.",
    };
  }

  if (input.purpose === "booking") {
    if (!input.bookingId) {
      return { success: false, data: null, error: "bookingId required for booking verification" };
    }
    if (existing && existing.role !== ROLES.STUDENT) {
      return { success: false, data: null, error: "Staff accounts cannot use guest booking OTP" };
    }
  }

  if (existing && existing.status === ACCOUNT_STATUS.SUSPENDED) {
    return { success: false, data: null, error: "This account has been suspended." };
  }

  if (existing && existing.status === ACCOUNT_STATUS.INACTIVE) {
    return { success: false, data: null, error: "This account is inactive. Contact support." };
  }

  if (
    (input.purpose === "reset_password" ||
      input.purpose === "verify_email" ||
      input.purpose === "change_email" ||
      input.purpose === "two_factor" ||
      input.purpose === "sensitive_action") &&
    !existing
  ) {
    // Avoid account enumeration on password reset; other purposes need an account.
    if (input.purpose === "reset_password") {
      return {
        success: true,
        data: {
          email,
          expiresInMinutes: getPlatformSettings().authentication.otpExpirationMinutes || 10,
          resendAvailableInSeconds:
            getPlatformSettings().authentication.otpResendCooldownSeconds || 60,
        },
        error: null,
      };
    }
    return {
      success: false,
      data: null,
      error: "No account found for this email.",
    };
  }

  const issued = await issueAndSendOtp({
    email,
    purpose: input.purpose,
    userId: existing?.id ?? null,
    rememberMe: Boolean(input.rememberMe),
    meta: {
      firstName: input.firstName ? sanitizeString(input.firstName) : null,
      lastName: input.lastName ? sanitizeString(input.lastName) : null,
      bookingId: input.bookingId ?? null,
      role: ROLES.STUDENT,
    },
    failClosed: true,
    ctx: input.ctx,
  });

  if (!issued.success || !issued.data) {
    return { success: false, data: null, error: issued.error };
  }

  if (input.purpose === "reset_password") {
    await logActivity({
      actorId: existing?.id ?? null,
      action: ACTIVITY_ACTIONS.PASSWORD_RESET_REQUEST,
      entityType: "user",
      entityId: existing?.id ?? email,
      metadata: {
        email,
        emailMode: issued.data.emailDelivery,
        emailOutboxId: issued.data.emailOutboxId,
      },
      ...input.ctx,
    });
  }

  return {
    success: true,
    data: {
      email: issued.data.email,
      expiresInMinutes: issued.data.expiresInMinutes,
      resendAvailableInSeconds: issued.data.resendAvailableInSeconds,
      emailDelivery: issued.data.emailDelivery,
      emailOutboxId: issued.data.emailOutboxId,
      ...(issued.data.demoOtp ? { demoOtp: issued.data.demoOtp } : {}),
    },
    error: null,
  };
}

export async function verifyOtp(input: {
  email: string;
  token: string;
  purpose: OtpChallenge["purpose"];
  deviceFingerprint?: string | null;
  deviceLabel?: string | null;
  ctx?: RequestContext;
}): Promise<
  ApiResponse<{
    user: UserProfile;
    redirectTo: string;
    requiresProfile: boolean;
  }>
> {
  ensureSuperAdminSeeded();

  const email = sanitizeEmail(input.email);
  const validated = await validateOtpToken({
    email,
    purpose: input.purpose,
    token: input.token,
    ctx: input.ctx,
  });

  if (!validated.ok) {
    if (input.purpose === "login" && validated.reason === "invalid") {
      await logActivity({
        actorId: findUserByEmail(email)?.id ?? null,
        action: ACTIVITY_ACTIONS.LOGIN_FAILED,
        entityType: "otp",
        entityId: validated.challenge?.id ?? null,
        metadata: { email, purpose: input.purpose, reason: "invalid_code" },
        ...input.ctx,
      });
    }
    return { success: false, data: null, error: validated.error };
  }

  const challenge = validated.challenge;
  markOtpVerified(challenge.id);

  let user = findUserByEmail(email);

  if (input.purpose === "register") {
    try {
      return await finalizeEnterpriseRegistration({
        email,
        challenge,
        ctx: input.ctx,
        issueSession,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "DUPLICATE_IDENTITY") {
        return {
          success: false,
          data: null,
          error: "An account already exists for this email or phone. Please sign in.",
        };
      }
      throw error;
    }
  } else if (input.purpose === "booking") {
    const bookingId =
      typeof challenge.meta.bookingId === "string" ? challenge.meta.bookingId : null;
    if (!bookingId) {
      return { success: false, data: null, error: "Booking reference missing from verification." };
    }

    if (!user) {
      const created = createUser({
        email,
        firstName: (challenge.meta.firstName as string | null) ?? null,
        lastName: (challenge.meta.lastName as string | null) ?? null,
        role: ROLES.STUDENT,
        status: ACCOUNT_STATUS.ACTIVE,
      });
      created.emailVerified = true;
      created.profileComplete = isStudentProfileComplete(created);
      writeAuthDb((d) => {
        d.users.push(created);
        d.otps = d.otps.filter((o) => o.id !== challenge.id);
      });
      user = created;
      await logActivity({
        actorId: created.id,
        action: ACTIVITY_ACTIONS.USER_CREATED,
        entityType: "user",
        entityId: created.id,
        metadata: { email, role: created.role, via: "guest_booking" },
        ...input.ctx,
      });
    } else {
      if (user.role !== ROLES.STUDENT) {
        return {
          success: false,
          data: null,
          error: "Only student accounts can complete guest bookings.",
        };
      }
      if (!AUTHENTICATABLE_STATUSES.includes(user.status)) {
        return {
          success: false,
          data: null,
          error: "Account cannot sign in in its current status.",
        };
      }
      writeAuthDb((d) => {
        const u = d.users.find((x) => x.id === user!.id);
        if (u) {
          u.emailVerified = true;
          if (u.status === ACCOUNT_STATUS.PENDING) u.status = ACCOUNT_STATUS.ACTIVE;
          if (!u.firstName && challenge.meta.firstName) {
            u.firstName = sanitizeString(String(challenge.meta.firstName));
          }
          if (!u.lastName && challenge.meta.lastName) {
            u.lastName = sanitizeString(String(challenge.meta.lastName));
          }
          u.profileComplete = isStudentProfileComplete(u);
          u.updatedAt = nowIso();
        }
        d.otps = d.otps.filter((o) => o.id !== challenge.id);
      });
      user = findUserById(user.id)!;
    }

    const { finalizeGuestBooking } = await import("@/services/bookings/booking-service");
    const booking = await finalizeGuestBooking({ bookingId, userId: user.id });
    const { profile } = await issueSession(user, true, {
      ...(input.ctx ?? {}),
      deviceFingerprint: input.deviceFingerprint ?? input.ctx?.deviceFingerprint ?? null,
      deviceLabel: input.deviceLabel ?? input.ctx?.deviceLabel ?? null,
    });

    await logActivity({
      actorId: profile.id,
      action: ACTIVITY_ACTIONS.LOGIN,
      entityType: "session",
      entityId: profile.id,
      metadata: { via: "guest_booking", bookingId },
      ...input.ctx,
    });

    const redirectTo =
      booking.status === "confirmed" ? `/bookings/join/${booking.id}` : "/student/bookings";

    return {
      success: true,
      data: {
        user: profile,
        redirectTo,
        requiresProfile: !profile.profileComplete,
      },
      error: null,
    };
  } else if (input.purpose === "login" || input.purpose === "verify_email") {
    if (!user) {
      return { success: false, data: null, error: "Account not found." };
    }
    if (!AUTHENTICATABLE_STATUSES.includes(user.status)) {
      return { success: false, data: null, error: "Account cannot sign in in its current status." };
    }
    writeAuthDb((d) => {
      const u = d.users.find((x) => x.id === user!.id);
      if (u) {
        u.emailVerified = true;
        // Students pending email verify become active; instructors awaiting admin stay pending.
        if (u.status === ACCOUNT_STATUS.PENDING && u.role !== ROLES.INSTRUCTOR) {
          u.status = ACCOUNT_STATUS.ACTIVE;
        }
        u.updatedAt = nowIso();
      }
      d.otps = d.otps.filter((o) => o.id !== challenge.id);
    });
    user = findUserById(user.id)!;
  } else if (input.purpose === "reset_password") {
    // OTP verified — caller should proceed to set password with a short-lived reset token
    if (!user) {
      return { success: false, data: null, error: "Account not found." };
    }
    writeAuthDb((d) => {
      d.otps = d.otps.filter((o) => o.id !== challenge.id);
      // Create a follow-up reset challenge marked verified via meta
      d.otps.push({
        id: generateId(),
        email,
        userId: user!.id,
        purpose: "reset_password",
        codeHash: hashValue(`reset:${generateToken(16)}`),
        status: "verified",
        attempts: 0,
        maxAttempts: 5,
        resendCount: 0,
        rememberMe: false,
        lockedUntil: null,
        resendAvailableAt: null,
        pendingRegistrationId: null,
        meta: { verified: true, resetToken: generateToken(24) },
        ipAddress: input.ctx?.ipAddress ?? null,
        userAgent: input.ctx?.userAgent ?? null,
        deviceFingerprint: input.deviceFingerprint ?? null,
        deviceLabel: input.deviceLabel ?? null,
        expiresAt: addMinutes(15),
        verifiedAt: nowIso(),
        createdAt: nowIso(),
      });
    });
  }

  if (!user) {
    return { success: false, data: null, error: "Unable to complete verification." };
  }

  if (input.purpose === "reset_password") {
    const resetChallenge = readAuthDb().otps.find(
      (o) => o.email === email && o.purpose === "reset_password" && o.meta.verified,
    );
    return {
      success: true,
      data: {
        user: toUserProfile(user),
        redirectTo: `/reset-password?email=${encodeURIComponent(email)}&token=${resetChallenge?.meta.resetToken ?? ""}`,
        requiresProfile: !user.profileComplete,
      },
      error: null,
    };
  }

  const { profile } = await issueSession(user, challenge.rememberMe, {
    ...(input.ctx ?? {}),
    deviceFingerprint: input.deviceFingerprint ?? input.ctx?.deviceFingerprint ?? null,
    deviceLabel: input.deviceLabel ?? input.ctx?.deviceLabel ?? null,
  });

  await logActivity({
    actorId: profile.id,
    action: ACTIVITY_ACTIONS.LOGIN,
    entityType: "session",
    entityId: profile.id,
    metadata: {
      rememberMe: challenge.rememberMe,
      deviceFingerprint: input.deviceFingerprint
        ? String(input.deviceFingerprint).slice(0, 8)
        : null,
    },
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

export async function resetPassword(input: {
  email: string;
  resetToken: string;
  password: string;
  ctx?: RequestContext;
}): Promise<ApiResponse<{ email: string }>> {
  const email = sanitizeEmail(input.email);
  const db = readAuthDb();
  const challenge = db.otps.find(
    (o) =>
      o.email === email &&
      o.purpose === "reset_password" &&
      o.meta.verified &&
      o.meta.resetToken === input.resetToken,
  );

  if (!challenge || new Date(challenge.expiresAt).getTime() <= Date.now()) {
    return { success: false, data: null, error: "Reset link expired. Request a new one." };
  }

  const user = findUserByEmail(email);
  if (!user) {
    return { success: false, data: null, error: "Account not found." };
  }

  const { hash, salt } = hashPassword(input.password);
  writeAuthDb((d) => {
    const u = d.users.find((x) => x.id === user.id);
    if (u) {
      u.passwordHash = hash;
      u.passwordSalt = salt;
      u.updatedAt = nowIso();
    }
    d.otps = d.otps.filter((o) => o.id !== challenge.id);
    // Revoke all sessions
    d.sessions.forEach((s) => {
      if (s.userId === user.id && !s.revokedAt) s.revokedAt = nowIso();
    });
  });

  await logActivity({
    actorId: user.id,
    action: ACTIVITY_ACTIONS.PASSWORD_RESET,
    entityType: "user",
    entityId: user.id,
    ...input.ctx,
  });

  return { success: true, data: { email }, error: null };
}

export async function completeProfile(input: {
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  countryCode?: string;
  nationality?: string;
  dateOfBirth?: string;
  gender?: string;
  city?: string;
  bio?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  timezone?: string;
  language?: string;
  ctx?: RequestContext;
}): Promise<ApiResponse<{ user: UserProfile; redirectTo: string }>> {
  const user = findUserById(input.userId);
  if (!user) {
    return { success: false, data: null, error: "User not found." };
  }

  writeAuthDb((d) => {
    const u = d.users.find((x) => x.id === input.userId);
    if (!u) return;
    u.firstName = sanitizeString(input.firstName);
    u.lastName = sanitizeString(input.lastName);
    u.phone = input.phone ? sanitizeString(input.phone) : u.phone;
    u.countryCode = input.countryCode || u.countryCode;
    u.nationality = input.nationality ? sanitizeString(input.nationality) : u.nationality;
    u.dateOfBirth = input.dateOfBirth ? sanitizeString(input.dateOfBirth) : u.dateOfBirth;
    u.gender = input.gender ? sanitizeString(input.gender) : u.gender;
    u.city = input.city ? sanitizeString(input.city) : u.city;
    u.bio = input.bio ? sanitizeString(input.bio) : u.bio;
    u.emergencyContactName = input.emergencyContactName
      ? sanitizeString(input.emergencyContactName)
      : u.emergencyContactName;
    u.emergencyContactPhone = input.emergencyContactPhone
      ? sanitizeString(input.emergencyContactPhone)
      : u.emergencyContactPhone;
    u.timezone = input.timezone ?? u.timezone;
    u.language = input.language ?? u.language;
    u.profileComplete = isStudentProfileComplete(u);
    if (u.role === ROLES.STUDENT && !u.profileComplete) {
      /* keep incomplete until required fields are filled */
    } else if (u.status === ACCOUNT_STATUS.PENDING && u.role !== ROLES.INSTRUCTOR) {
      u.status = ACCOUNT_STATUS.ACTIVE;
    }
    u.updatedAt = nowIso();
  });

  const fresh = findUserById(input.userId)!;
  if (fresh.role === ROLES.STUDENT && !fresh.profileComplete) {
    return {
      success: false,
      data: null,
      error: "Please complete name, phone, country, and nationality to continue.",
    };
  }

  const profile = toUserProfile(fresh);

  // Refresh JWT claims so middleware sees profileComplete
  const parsed = await readSessionCookie();
  if (parsed) {
    const env = getServerEnv();
    const days = env.AUTH_SESSION_DAYS;
    await setSessionCookies(
      parsed.payload.sid,
      parsed.rawToken,
      {
        userId: profile.id,
        role: profile.role,
        status: profile.status,
        profileComplete: profile.profileComplete,
      },
      days * 86_400,
    );
  }

  await logActivity({
    actorId: profile.id,
    action: ACTIVITY_ACTIONS.PROFILE_COMPLETE,
    entityType: "user",
    entityId: profile.id,
    ...input.ctx,
  });

  return {
    success: true,
    data: {
      user: profile,
      redirectTo: ROLE_DASHBOARD[profile.role],
    },
    error: null,
  };
}

export async function updateProfile(
  userId: string,
  patch: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    countryCode: string;
    nationality: string;
    dateOfBirth: string;
    gender: string;
    city: string;
    bio: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    avatarUrl: string;
    timezone: string;
    language: string;
  }>,
  ctx?: RequestContext,
): Promise<ApiResponse<{ user: UserProfile }>> {
  const user = findUserById(userId);
  if (!user) {
    return { success: false, data: null, error: "User not found." };
  }

  writeAuthDb((d) => {
    const u = d.users.find((x) => x.id === userId);
    if (!u) return;
    if (patch.firstName !== undefined) u.firstName = sanitizeString(patch.firstName);
    if (patch.lastName !== undefined) u.lastName = sanitizeString(patch.lastName);
    if (patch.phone !== undefined) u.phone = patch.phone ? sanitizeString(patch.phone) : null;
    if (patch.countryCode !== undefined) u.countryCode = patch.countryCode || null;
    if (patch.nationality !== undefined) {
      u.nationality = patch.nationality ? sanitizeString(patch.nationality) : null;
    }
    if (patch.dateOfBirth !== undefined) {
      u.dateOfBirth = patch.dateOfBirth ? sanitizeString(patch.dateOfBirth) : null;
    }
    if (patch.gender !== undefined) u.gender = patch.gender ? sanitizeString(patch.gender) : null;
    if (patch.city !== undefined) u.city = patch.city ? sanitizeString(patch.city) : null;
    if (patch.bio !== undefined) u.bio = patch.bio ? sanitizeString(patch.bio) : null;
    if (patch.emergencyContactName !== undefined) {
      u.emergencyContactName = patch.emergencyContactName
        ? sanitizeString(patch.emergencyContactName)
        : null;
    }
    if (patch.emergencyContactPhone !== undefined) {
      u.emergencyContactPhone = patch.emergencyContactPhone
        ? sanitizeString(patch.emergencyContactPhone)
        : null;
    }
    if (patch.avatarUrl !== undefined) u.avatarUrl = patch.avatarUrl;
    if (patch.timezone !== undefined) u.timezone = patch.timezone;
    if (patch.language !== undefined) u.language = patch.language;
    u.profileComplete = isStudentProfileComplete(u);
    u.updatedAt = nowIso();
  });

  const profile = toUserProfile(findUserById(userId)!);

  const parsed = await readSessionCookie();
  if (parsed) {
    const env = getServerEnv();
    await setSessionCookies(
      parsed.payload.sid,
      parsed.rawToken,
      {
        userId: profile.id,
        role: profile.role,
        status: profile.status,
        profileComplete: profile.profileComplete,
      },
      env.AUTH_SESSION_DAYS * 86_400,
    );
  }

  await logActivity({
    actorId: userId,
    action: ACTIVITY_ACTIONS.PROFILE_UPDATE,
    entityType: "user",
    entityId: userId,
    metadata: { fields: Object.keys(patch) },
    ...ctx,
  });

  return {
    success: true,
    data: { user: profile },
    error: null,
  };
}

export async function signOut(ctx?: RequestContext): Promise<ApiResponse<null>> {
  const parsed = await readSessionCookie();
  if (parsed) {
    const db = readAuthDb();
    const session = db.sessions.find((s) => s.id === parsed.payload.sid);
    writeAuthDb((d) => {
      const s = d.sessions.find((x) => x.id === parsed.payload.sid);
      if (s && !s.revokedAt) s.revokedAt = nowIso();
    });
    if (session) {
      await logActivity({
        actorId: session.userId,
        action: ACTIVITY_ACTIONS.LOGOUT,
        entityType: "session",
        entityId: session.id,
        ...ctx,
      });
    }
  }
  await clearSessionCookies();
  return { success: true, data: null, error: null };
}

export function verifyStoredPassword(userId: string, password: string): boolean {
  const user = findUserById(userId);
  if (!user?.passwordHash || !user.passwordSalt) return false;
  return verifyPassword(password, user.passwordHash, user.passwordSalt);
}

export { ROLE_DASHBOARD };
