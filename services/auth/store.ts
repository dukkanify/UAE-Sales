/**
 * Local durable auth data store.
 * Used when Supabase is not configured so OTP auth works end-to-end in development.
 * Production should use Supabase Auth + PostgreSQL tables from database/migrations.
 */

import path from "path";

import { dataDir, readJsonFile, writeJsonFile } from "@/lib/data/json-file-store";
import type {
  ActivityLogRecord,
  AuditLogRecord,
  NotificationRecord,
  SessionRecord,
  UserProfile,
} from "@/types";
import type { AccountStatus } from "@/constants/account-status";
import type { Role } from "@/constants/roles";

export interface StoredUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  countryCode: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  city: string | null;
  bio: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  avatarUrl: string | null;
  timezone: string;
  language: string;
  role: Role;
  status: AccountStatus;
  emailVerified: boolean;
  profileComplete: boolean;
  passwordHash: string | null;
  passwordSalt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OtpChallenge {
  id: string;
  email: string;
  purpose: "login" | "register" | "reset_password" | "verify_email" | "booking";
  codeHash: string;
  attempts: number;
  maxAttempts: number;
  rememberMe: boolean;
  lockedUntil: string | null;
  resendAvailableAt: string | null;
  pendingRegistrationId: string | null;
  meta: Record<string, unknown>;
  expiresAt: string;
  createdAt: string;
}

/** Pre-verification registration payload — account is not active until OTP succeeds. */
export interface PendingRegistration {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  countryCode: string;
  nationality: string;
  passwordHash: string;
  passwordSalt: string;
  role: Role;
  acceptTermsAt: string;
  acceptPrivacyAt: string;
  marketingConsent: boolean;
  timezone: string;
  language: string;
  rememberMe: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface NotificationPreferences {
  userId: string;
  emailTransactional: boolean;
  emailMarketing: boolean;
  emailProductUpdates: boolean;
  inAppEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSecuritySettings {
  userId: string;
  twoFactorEnabled: boolean;
  loginAlertsEnabled: boolean;
  failedLoginCount: number;
  lockedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthDatabase {
  users: StoredUser[];
  sessions: SessionRecord[];
  otps: OtpChallenge[];
  pendingRegistrations: PendingRegistration[];
  notificationPreferences: NotificationPreferences[];
  securitySettings: UserSecuritySettings[];
  notifications: NotificationRecord[];
  activityLogs: ActivityLogRecord[];
  auditLogs: AuditLogRecord[];
  seeded: boolean;
}

const DATA_FILE = path.join(dataDir(), "aep-auth.json");

const emptyDb = (): AuthDatabase => ({
  users: [],
  sessions: [],
  otps: [],
  pendingRegistrations: [],
  notificationPreferences: [],
  securitySettings: [],
  notifications: [],
  activityLogs: [],
  auditLogs: [],
  seeded: false,
});

function ensureStore(): AuthDatabase {
  const parsed = {
    ...emptyDb(),
    ...readJsonFile<Partial<AuthDatabase>>(DATA_FILE, emptyDb),
  } as AuthDatabase;
  parsed.users = (parsed.users ?? []).map(normalizeStoredUser);
  parsed.sessions = (parsed.sessions ?? []).map(normalizeSession);
  parsed.otps = (parsed.otps ?? []).map(normalizeOtp);
  parsed.pendingRegistrations = parsed.pendingRegistrations ?? [];
  parsed.notificationPreferences = parsed.notificationPreferences ?? [];
  parsed.securitySettings = parsed.securitySettings ?? [];
  parsed.notifications = parsed.notifications ?? [];
  parsed.activityLogs = parsed.activityLogs ?? [];
  parsed.auditLogs = parsed.auditLogs ?? [];
  parsed.seeded = Boolean(parsed.seeded);
  return parsed;
}

/** Backfill fields added after early auth JSON snapshots. */
function normalizeOtp(otp: OtpChallenge): OtpChallenge {
  return {
    ...otp,
    maxAttempts: otp.maxAttempts ?? 5,
    lockedUntil: otp.lockedUntil ?? null,
    resendAvailableAt: otp.resendAvailableAt ?? null,
    pendingRegistrationId: otp.pendingRegistrationId ?? null,
    meta: otp.meta ?? {},
  };
}

/** Backfill fields added after early auth JSON snapshots. */
function normalizeSession(session: SessionRecord): SessionRecord {
  return {
    ...session,
    deviceFingerprint: session.deviceFingerprint ?? null,
    deviceLabel: session.deviceLabel ?? null,
  };
}

/** Backfill fields added after early auth JSON snapshots. */
function normalizeStoredUser(user: StoredUser): StoredUser {
  return {
    ...user,
    phone: user.phone ?? null,
    countryCode: user.countryCode ?? null,
    nationality: user.nationality ?? null,
    dateOfBirth: user.dateOfBirth ?? null,
    gender: user.gender ?? null,
    city: user.city ?? null,
    bio: user.bio ?? null,
    emergencyContactName: user.emergencyContactName ?? null,
    emergencyContactPhone: user.emergencyContactPhone ?? null,
    avatarUrl: user.avatarUrl ?? null,
    timezone: user.timezone || "UTC",
    language: user.language || "en",
  };
}

function saveStore(db: AuthDatabase): void {
  writeJsonFile(DATA_FILE, db);
}

export function readAuthDb(): AuthDatabase {
  return ensureStore();
}

export function writeAuthDb(mutator: (db: AuthDatabase) => void): AuthDatabase {
  const db = ensureStore();
  mutator(db);
  saveStore(db);
  return db;
}

export function toUserProfile(user: StoredUser): UserProfile {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName,
    phone: user.phone ?? null,
    countryCode: user.countryCode ?? null,
    nationality: user.nationality ?? null,
    dateOfBirth: user.dateOfBirth ?? null,
    gender: user.gender ?? null,
    city: user.city ?? null,
    bio: user.bio ?? null,
    emergencyContactName: user.emergencyContactName ?? null,
    emergencyContactPhone: user.emergencyContactPhone ?? null,
    avatarUrl: user.avatarUrl ?? null,
    timezone: user.timezone || "UTC",
    language: user.language || "en",
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    profileComplete: user.profileComplete,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/** Student accounts need contact + identity basics before the learning console. */
export function isStudentProfileComplete(
  user: Pick<
    StoredUser,
    "firstName" | "lastName" | "phone" | "countryCode" | "nationality" | "role"
  >,
): boolean {
  if (user.role !== "student") {
    return Boolean(user.firstName && user.lastName);
  }
  return Boolean(
    user.firstName &&
    user.lastName &&
    user.phone &&
    user.phone.trim().length >= 7 &&
    user.countryCode &&
    user.nationality &&
    user.nationality.trim().length >= 2,
  );
}

export function findUserByEmail(email: string): StoredUser | null {
  const db = readAuthDb();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function findUserByPhone(phone: string): StoredUser | null {
  const normalized = phone.replace(/\s+/g, "");
  if (!normalized) return null;
  const db = readAuthDb();
  return (
    db.users.find((u) => {
      if (!u.phone) return false;
      return u.phone.replace(/\s+/g, "") === normalized;
    }) ?? null
  );
}

export function findUserById(id: string): StoredUser | null {
  const db = readAuthDb();
  return db.users.find((u) => u.id === id) ?? null;
}

export function findPendingRegistrationByEmail(email: string): PendingRegistration | null {
  const db = readAuthDb();
  const now = Date.now();
  return (
    db.pendingRegistrations.find(
      (p) => p.email.toLowerCase() === email.toLowerCase() && new Date(p.expiresAt).getTime() > now,
    ) ?? null
  );
}

export function findPendingRegistrationById(id: string): PendingRegistration | null {
  const db = readAuthDb();
  return db.pendingRegistrations.find((p) => p.id === id) ?? null;
}

export function defaultNotificationPreferences(
  userId: string,
  marketingConsent: boolean,
): NotificationPreferences {
  const ts = new Date().toISOString();
  return {
    userId,
    emailTransactional: true,
    emailMarketing: Boolean(marketingConsent),
    emailProductUpdates: Boolean(marketingConsent),
    inAppEnabled: true,
    createdAt: ts,
    updatedAt: ts,
  };
}

export function defaultSecuritySettings(userId: string): UserSecuritySettings {
  const ts = new Date().toISOString();
  return {
    userId,
    twoFactorEnabled: false,
    loginAlertsEnabled: true,
    failedLoginCount: 0,
    lockedUntil: null,
    createdAt: ts,
    updatedAt: ts,
  };
}
