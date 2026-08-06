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
  constantTimeEqual,
  generateId,
  generateOtp,
  generateToken,
  hashPassword,
  hashValue,
  verifyPassword,
} from "@/lib/security/crypto";
import { rateLimit } from "@/lib/security/rate-limit";
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
import { ensureSuperAdminSeeded } from "@/services/auth/seed";
import { getPlatformSettings } from "@/services/settings/settings-service";

export interface RequestContext {
  ipAddress?: string | null;
  userAgent?: string | null;
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

function demoOtpEnabled(): boolean {
  const env = getServerEnv();
  if (!env.ENABLE_DEMO_OTP) return false;
  // `next start` / CI e2e set NODE_ENV=production; still allow demo OTP for
  // non-production app environments or explicit FORCE_DEMO_OTP.
  if (process.env.NODE_ENV !== "production") return true;
  if (process.env.FORCE_DEMO_OTP === "true") return true;
  return process.env.NEXT_PUBLIC_APP_ENV !== "production";
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
  const days = rememberMe ? env.AUTH_REMEMBER_ME_DAYS : env.AUTH_SESSION_DAYS;
  const token = generateToken(32);
  const sessionId = generateId();
  const expiresAt = addDays(days);

  writeAuthDb((db) => {
    db.sessions.push({
      id: sessionId,
      userId: user.id,
      tokenHash: hashSessionToken(token),
      userAgent: ctx.userAgent ?? null,
      ipAddress: ctx.ipAddress ?? null,
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
}): Promise<ApiResponse<{ email: string; demoOtp?: string; expiresInMinutes: number }>> {
  ensureSuperAdminSeeded();
  // CI / local demo: ensure student.one etc. exist before login OTP.
  if (demoOtpEnabled()) ensureDemoUsersSeeded();

  const email = sanitizeEmail(input.email);
  const rl = rateLimit(`otp:${email}:${input.purpose}`, 5, 15 * 60_000);
  if (!rl.allowed) {
    return { success: false, data: null, error: "Too many OTP requests. Please try again later." };
  }

  const env = getServerEnv();
  const existing = findUserByEmail(email);

  if (input.purpose === "login" && !existing) {
    return {
      success: false,
      data: null,
      error: "No account found for this email. Please register first.",
    };
  }

  if (input.purpose === "register" && existing) {
    return {
      success: false,
      data: null,
      error: "An account with this email already exists. Please sign in.",
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

  const code = demoOtpEnabled() ? env.DEMO_OTP_CODE : generateOtp(6);
  const challenge: OtpChallenge = {
    id: generateId(),
    email,
    purpose: input.purpose,
    codeHash: hashValue(code),
    attempts: 0,
    rememberMe: Boolean(input.rememberMe),
    meta: {
      firstName: input.firstName ? sanitizeString(input.firstName) : null,
      lastName: input.lastName ? sanitizeString(input.lastName) : null,
      bookingId: input.bookingId ?? null,
      role:
        input.purpose === "register" && input.role === ROLES.INSTRUCTOR
          ? ROLES.INSTRUCTOR
          : ROLES.STUDENT,
    },
    expiresAt: addMinutes(env.AUTH_OTP_EXPIRY_MINUTES),
    createdAt: nowIso(),
  };

  writeAuthDb((db) => {
    db.otps = db.otps.filter((o) => !(o.email === email && o.purpose === input.purpose));
    db.otps.push(challenge);
  });

  if (input.purpose === "reset_password") {
    await logActivity({
      actorId: existing?.id ?? null,
      action: ACTIVITY_ACTIONS.PASSWORD_RESET_REQUEST,
      entityType: "user",
      entityId: existing?.id ?? email,
      metadata: { email },
      ...input.ctx,
    });
  }

  return {
    success: true,
    data: {
      email,
      expiresInMinutes: env.AUTH_OTP_EXPIRY_MINUTES,
      ...(demoOtpEnabled() ? { demoOtp: code } : {}),
    },
    error: null,
  };
}

export async function verifyOtp(input: {
  email: string;
  token: string;
  purpose: OtpChallenge["purpose"];
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
  const token = input.token.trim();
  const rl = rateLimit(`otp-verify:${email}`, 10, 15 * 60_000);
  if (!rl.allowed) {
    return { success: false, data: null, error: "Too many verification attempts." };
  }

  const db = readAuthDb();
  const challenge = db.otps.find((o) => o.email === email && o.purpose === input.purpose);

  if (!challenge) {
    return { success: false, data: null, error: "No active verification code. Request a new one." };
  }

  if (new Date(challenge.expiresAt).getTime() <= Date.now()) {
    writeAuthDb((d) => {
      d.otps = d.otps.filter((o) => o.id !== challenge.id);
    });
    return { success: false, data: null, error: "Verification code expired. Request a new one." };
  }

  if (challenge.attempts >= 5) {
    return { success: false, data: null, error: "Too many invalid attempts. Request a new code." };
  }

  if (!constantTimeEqual(challenge.codeHash, hashValue(token))) {
    writeAuthDb((d) => {
      const o = d.otps.find((x) => x.id === challenge.id);
      if (o) o.attempts += 1;
    });
    return { success: false, data: null, error: "Invalid verification code." };
  }

  let user = findUserByEmail(email);

  if (input.purpose === "register") {
    const intendedRole =
      challenge.meta.role === ROLES.INSTRUCTOR ? ROLES.INSTRUCTOR : ROLES.STUDENT;
    const approvalRequired = Boolean(getPlatformSettings().users.instructorApprovalRequired);
    const status =
      intendedRole === ROLES.INSTRUCTOR && approvalRequired
        ? ACCOUNT_STATUS.PENDING
        : ACCOUNT_STATUS.ACTIVE;
    const created = createUser({
      email,
      firstName: (challenge.meta.firstName as string | null) ?? null,
      lastName: (challenge.meta.lastName as string | null) ?? null,
      role: intendedRole,
      status,
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
      metadata: { email, role: created.role, status: created.status },
      ...input.ctx,
    });
    await logActivity({
      actorId: created.id,
      action: ACTIVITY_ACTIONS.EMAIL_VERIFIED,
      entityType: "user",
      entityId: created.id,
      ...input.ctx,
    });
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
    const { profile } = await issueSession(user, true, input.ctx ?? {});

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
        purpose: "reset_password",
        codeHash: hashValue(`reset:${generateToken(16)}`),
        attempts: 0,
        rememberMe: false,
        meta: { verified: true, resetToken: generateToken(24) },
        expiresAt: addMinutes(15),
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

  const { profile } = await issueSession(user, challenge.rememberMe, input.ctx ?? {});

  await logActivity({
    actorId: profile.id,
    action: ACTIVITY_ACTIONS.LOGIN,
    entityType: "session",
    entityId: profile.id,
    metadata: { rememberMe: challenge.rememberMe },
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
