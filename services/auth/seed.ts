/**
 * Seeds the first Super Admin account on first boot.
 * Future admins can only be created by an existing Super Admin.
 */

import { ACCOUNT_STATUS } from "@/constants/account-status";
import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import { ROLES } from "@/constants/roles";
import { getServerEnv } from "@/config/env";
import { agentLog } from "@/lib/debug/agent-log";
import { generateId } from "@/lib/security/crypto";
import { findUserByEmail, readAuthDb, writeAuthDb } from "@/services/auth/store";
import { logActivity, logAudit } from "@/services/auth/activity-log";

let seededInProcess = false;

export function ensureSuperAdminSeeded(): void {
  // #region agent log
  agentLog({
    hypothesisId: "C",
    location: "auth/seed.ts:ensureSuperAdminSeeded",
    message: "ensureSuperAdminSeeded entry",
    data: { seededInProcess },
  });
  // #endregion
  if (seededInProcess) return;

  const db = readAuthDb();
  if (db.seeded && db.users.some((u) => u.role === ROLES.SUPER_ADMIN)) {
    seededInProcess = true;
    return;
  }

  let env: ReturnType<typeof getServerEnv>;
  try {
    env = getServerEnv();
  } catch (error) {
    // Never 500 marketing SSR because env validation failed during seed.
    console.error("[auth-seed] getServerEnv failed", error);
    seededInProcess = true;
    return;
  }
  const email = env.SUPER_ADMIN_EMAIL.toLowerCase();
  const existing = findUserByEmail(email);

  if (existing) {
    if (existing.role !== ROLES.SUPER_ADMIN) {
      writeAuthDb((d) => {
        const u = d.users.find((x) => x.id === existing.id);
        if (u) {
          u.role = ROLES.SUPER_ADMIN;
          u.status = ACCOUNT_STATUS.ACTIVE;
          u.emailVerified = true;
          u.profileComplete = true;
          u.updatedAt = new Date().toISOString();
        }
        d.seeded = true;
      });
    } else {
      writeAuthDb((d) => {
        d.seeded = true;
      });
    }
    seededInProcess = true;
    return;
  }

  const ts = new Date().toISOString();
  const id = generateId();

  writeAuthDb((d) => {
    d.users.push({
      id,
      email,
      firstName: env.SUPER_ADMIN_FIRST_NAME,
      lastName: env.SUPER_ADMIN_LAST_NAME,
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
      role: ROLES.SUPER_ADMIN,
      status: ACCOUNT_STATUS.ACTIVE,
      emailVerified: true,
      profileComplete: true,
      passwordHash: null,
      passwordSalt: null,
      lastLoginAt: null,
      createdAt: ts,
      updatedAt: ts,
    });
    d.seeded = true;
  });

  void logActivity({
    actorId: id,
    action: ACTIVITY_ACTIONS.USER_CREATED,
    entityType: "user",
    entityId: id,
    metadata: { email, role: ROLES.SUPER_ADMIN, seeded: true },
  });

  void logAudit({
    actorId: id,
    action: "seed.super_admin",
    resource: `user:${id}`,
    afterState: { email, role: ROLES.SUPER_ADMIN },
  });

  seededInProcess = true;
}
