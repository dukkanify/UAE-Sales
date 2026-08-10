/**
 * Demo user seeder for local LMS / dashboard population.
 * Kept outside metrics to avoid circular imports with courses seed.
 */

import { ensureSuperAdminSeeded } from "@/services/auth/seed";
import {
  isStudentProfileComplete,
  readAuthDb,
  writeAuthDb,
  type StoredUser,
} from "@/services/auth/store";
import { ROLES, type Role } from "@/constants/roles";
import { ACCOUNT_STATUS } from "@/constants/account-status";
import { generateId } from "@/lib/security/crypto";

type DemoUser = Partial<StoredUser> & {
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
};

export function ensureDemoUsersSeeded(): void {
  ensureSuperAdminSeeded();
  const db = readAuthDb();
  if (db.users.length <= 1) {
    seedFreshDemoUsers();
  }
  ensureCgiDemoUser();
  backfillDemoStudentDetails();
}

function backfillDemoStudentDetails(): void {
  const enrich: Record<
    string,
    Pick<
      StoredUser,
      | "phone"
      | "nationality"
      | "dateOfBirth"
      | "gender"
      | "city"
      | "bio"
      | "emergencyContactName"
      | "emergencyContactPhone"
      | "countryCode"
    >
  > = {
    "student.one@eagerpilots.com": {
      phone: "+201001112233",
      countryCode: "EG",
      nationality: "Egyptian",
      dateOfBirth: "1998-04-12",
      gender: "male",
      city: "Cairo",
      bio: "ATPL theory candidate focusing on meteorology and navigation.",
      emergencyContactName: "Hassan Khalil",
      emergencyContactPhone: "+201009998877",
    },
    "student.two@eagerpilots.com": {
      phone: "+966501234567",
      countryCode: "SA",
      nationality: "Saudi",
      dateOfBirth: "1999-11-03",
      gender: "female",
      city: "Riyadh",
      bio: "Working through Performance and Mass & Balance modules.",
      emergencyContactName: "Noura Nasser",
      emergencyContactPhone: "+966509876543",
    },
    "student.four@eagerpilots.com": {
      phone: "+447700900123",
      countryCode: "GB",
      nationality: "British",
      dateOfBirth: "1997-07-21",
      gender: "female",
      city: "London",
      bio: null,
      emergencyContactName: null,
      emergencyContactPhone: null,
    },
    "abdulaziz@aviatorpass.com": {
      phone: "+96550012345",
      countryCode: "KW",
      nationality: "Kuwaiti",
      dateOfBirth: "1996-01-18",
      gender: "male",
      city: "Kuwait City",
      bio: "Full ATPL ground school track.",
      emergencyContactName: "Family contact",
      emergencyContactPhone: "+96550098765",
    },
  };

  writeAuthDb((d) => {
    for (const user of d.users) {
      const patch = enrich[user.email];
      if (!patch) continue;
      if (user.phone && user.nationality) continue;
      Object.assign(user, patch);
      user.profileComplete = isStudentProfileComplete(user);
      user.updatedAt = new Date().toISOString();
    }
  });
}

function seedFreshDemoUsers(): void {
  const now = new Date().toISOString();
  const demo: DemoUser[] = [
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
      email: "cgi@eagerpilots.com",
      role: ROLES.CHIEF_GROUND_INSTRUCTOR,
      firstName: "Nadia",
      lastName: "Al Fahad",
      status: ACCOUNT_STATUS.ACTIVE,
      profileComplete: true,
      emailVerified: true,
      countryCode: "KW",
      phone: "+96550011122",
      nationality: "Kuwaiti",
      city: "Kuwait City",
      bio: "Chief Ground Instructor for the ATPL theory journey.",
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
      phone: "+971501112233",
      nationality: "British",
      city: "Dubai",
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
      phone: "+971509998877",
      nationality: "Emirati",
      city: "Abu Dhabi",
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
      phone: "+201001112233",
      nationality: "Egyptian",
      dateOfBirth: "1998-04-12",
      gender: "male",
      city: "Cairo",
      bio: "ATPL theory candidate focusing on meteorology and navigation.",
      emergencyContactName: "Hassan Khalil",
      emergencyContactPhone: "+201009998877",
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
      phone: "+966501234567",
      nationality: "Saudi",
      dateOfBirth: "1999-11-03",
      gender: "female",
      city: "Riyadh",
      bio: "Working through Performance and Mass & Balance modules.",
      emergencyContactName: "Noura Nasser",
      emergencyContactPhone: "+966509876543",
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
      phone: "+447700900123",
      nationality: "British",
      dateOfBirth: "1997-07-21",
      gender: "female",
      city: "London",
    },
    {
      email: "abdulaziz@aviatorpass.com",
      role: ROLES.STUDENT,
      firstName: "Abdulaziz",
      lastName: "Alshoail",
      status: ACCOUNT_STATUS.ACTIVE,
      profileComplete: true,
      emailVerified: true,
      countryCode: "KW",
      phone: "+96550012345",
      nationality: "Kuwaiti",
      dateOfBirth: "1996-01-18",
      gender: "male",
      city: "Kuwait City",
      bio: "Full ATPL ground school track.",
      emergencyContactName: "Family contact",
      emergencyContactPhone: "+96550098765",
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
        phone: row.phone ?? null,
        countryCode: row.countryCode ?? null,
        nationality: row.nationality ?? null,
        dateOfBirth: row.dateOfBirth ?? null,
        gender: row.gender ?? null,
        city: row.city ?? null,
        bio: row.bio ?? null,
        emergencyContactName: row.emergencyContactName ?? null,
        emergencyContactPhone: row.emergencyContactPhone ?? null,
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

/** Backfill CGI demo account on existing databases. */
function ensureCgiDemoUser(): void {
  const email = "cgi@eagerpilots.com";
  writeAuthDb((d) => {
    if (d.users.some((u) => u.email === email)) return;
    const now = new Date().toISOString();
    d.users.push({
      id: generateId(),
      email,
      firstName: "Nadia",
      lastName: "Al Fahad",
      phone: "+96550011122",
      countryCode: "KW",
      nationality: "Kuwaiti",
      dateOfBirth: null,
      gender: null,
      city: "Kuwait City",
      bio: "Chief Ground Instructor for the ATPL theory journey.",
      emergencyContactName: null,
      emergencyContactPhone: null,
      avatarUrl: null,
      timezone: "UTC",
      language: "en",
      role: ROLES.CHIEF_GROUND_INSTRUCTOR,
      status: ACCOUNT_STATUS.ACTIVE,
      emailVerified: true,
      profileComplete: true,
      passwordHash: null,
      passwordSalt: null,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    });
  });
}
