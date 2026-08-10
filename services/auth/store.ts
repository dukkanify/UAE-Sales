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
  rememberMe: boolean;
  meta: Record<string, unknown>;
  expiresAt: string;
  createdAt: string;
}

interface AuthDatabase {
  users: StoredUser[];
  sessions: SessionRecord[];
  otps: OtpChallenge[];
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
  parsed.otps = parsed.otps ?? [];
  parsed.notifications = parsed.notifications ?? [];
  parsed.activityLogs = parsed.activityLogs ?? [];
  parsed.auditLogs = parsed.auditLogs ?? [];
  parsed.seeded = Boolean(parsed.seeded);
  return parsed;
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

export function findUserById(id: string): StoredUser | null {
  const db = readAuthDb();
  return db.users.find((u) => u.id === id) ?? null;
}
