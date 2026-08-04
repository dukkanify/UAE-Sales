/**
 * Demo user seeder for local LMS / dashboard population.
 * Kept outside metrics to avoid circular imports with courses seed.
 */

import { ensureSuperAdminSeeded } from "@/services/auth/seed";
import { readAuthDb, writeAuthDb, type StoredUser } from "@/services/auth/store";
import { ROLES, type Role } from "@/constants/roles";
import { ACCOUNT_STATUS } from "@/constants/account-status";
import { generateId } from "@/lib/security/crypto";

export function ensureDemoUsersSeeded(): void {
  ensureSuperAdminSeeded();
  const db = readAuthDb();
  if (db.users.length > 1) return;

  const now = new Date().toISOString();
  const demo: Array<
    Partial<StoredUser> & { email: string; role: Role; firstName: string; lastName: string }
  > = [
    {
      email: "admin@eagerpilots.com",
      role: ROLES.ADMIN,
      firstName: "Amina",
      lastName: "Hassan",
      status: ACCOUNT_STATUS.ACTIVE,
      profileComplete: true,
      emailVerified: true,
    },
    {
      email: "instructor.one@eagerpilots.com",
      role: ROLES.INSTRUCTOR,
      firstName: "James",
      lastName: "Carter",
      status: ACCOUNT_STATUS.ACTIVE,
      profileComplete: true,
      emailVerified: true,
      countryCode: "AE",
    },
    {
      email: "instructor.two@eagerpilots.com",
      role: ROLES.INSTRUCTOR,
      firstName: "Sara",
      lastName: "Al Mansoori",
      status: ACCOUNT_STATUS.ACTIVE,
      profileComplete: true,
      emailVerified: true,
      countryCode: "AE",
    },
    {
      email: "student.one@eagerpilots.com",
      role: ROLES.STUDENT,
      firstName: "Omar",
      lastName: "Khalil",
      status: ACCOUNT_STATUS.ACTIVE,
      profileComplete: true,
      emailVerified: true,
      countryCode: "EG",
    },
    {
      email: "student.two@eagerpilots.com",
      role: ROLES.STUDENT,
      firstName: "Layla",
      lastName: "Nasser",
      status: ACCOUNT_STATUS.ACTIVE,
      profileComplete: true,
      emailVerified: true,
      countryCode: "SA",
    },
    {
      email: "student.three@eagerpilots.com",
      role: ROLES.STUDENT,
      firstName: "Noah",
      lastName: "Brooks",
      status: ACCOUNT_STATUS.PENDING,
      profileComplete: false,
      emailVerified: true,
      countryCode: "US",
    },
    {
      email: "student.four@eagerpilots.com",
      role: ROLES.STUDENT,
      firstName: "Mia",
      lastName: "Chen",
      status: ACCOUNT_STATUS.SUSPENDED,
      profileComplete: true,
      emailVerified: true,
      countryCode: "GB",
    },
  ];

  writeAuthDb((d) => {
    for (const row of demo) {
      if (d.users.some((u) => u.email === row.email)) continue;
      d.users.push({
        id: generateId(),
        email: row.email,
        firstName: row.firstName,
        lastName: row.lastName,
        phone: null,
        countryCode: row.countryCode ?? null,
        nationality: null,
        avatarUrl: null,
        timezone: "UTC",
        language: "en",
        role: row.role,
        status: row.status ?? ACCOUNT_STATUS.ACTIVE,
        emailVerified: row.emailVerified ?? true,
        profileComplete: row.profileComplete ?? true,
        passwordHash: null,
        passwordSalt: null,
        lastLoginAt: null,
        createdAt: now,
        updatedAt: now,
      });
    }
  });
}
