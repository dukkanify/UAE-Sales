/**
 * Local durable auth data store.
 * Used when Supabase is not configured so OTP auth works end-to-end in development.
 * Production should use Supabase Auth + PostgreSQL tables from database/migrations.
 */

import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

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

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "aep-auth.json");

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
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!existsSync(DATA_FILE)) {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
  try {
    const raw = readFileSync(DATA_FILE, "utf8");
    return { ...emptyDb(), ...JSON.parse(raw) } as AuthDatabase;
  } catch {
    const db = emptyDb();
    writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
    return db;
  }
}

function saveStore(db: AuthDatabase): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
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
    phone: user.phone,
    countryCode: user.countryCode,
    nationality: user.nationality,
    avatarUrl: user.avatarUrl,
    timezone: user.timezone,
    language: user.language,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    profileComplete: user.profileComplete,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function findUserByEmail(email: string): StoredUser | null {
  const db = readAuthDb();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function findUserById(id: string): StoredUser | null {
  const db = readAuthDb();
  return db.users.find((u) => u.id === id) ?? null;
}
