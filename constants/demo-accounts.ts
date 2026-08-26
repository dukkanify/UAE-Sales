/**
 * Permanent demo accounts for development, QA, demos, and client review.
 * These are intentionally public demo credentials — not production secrets.
 */

import { ROLES, type Role } from "@/constants/roles";
import { ACCOUNT_STATUS, type AccountStatus } from "@/constants/account-status";
import { getPermissionsForRole } from "@/constants/roles";

/** Documented temporary password for password-reset / set-password demos. Login remains OTP-first. */
export const DEMO_ACCOUNT_PASSWORD = "DemoPass123!";

/** Demo OTP when ENABLE_DEMO_OTP=true (see AGENTS.md / config/env). */
export const DEMO_OTP_CODE_DEFAULT = "123456";

export type DemoAccountKey =
  | "super_admin"
  | "admin"
  | "cgi"
  | "instructor"
  | "instructor_secondary"
  | "student"
  | "student_secondary"
  | "student_pending"
  | "student_suspended"
  | "student_journey";

export type DemoAccountDefinition = {
  key: DemoAccountKey;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  status: AccountStatus;
  /** Primary showcase accounts always reactivated on reset. */
  permanent: boolean;
  profileComplete: boolean;
  emailVerified: boolean;
  phone: string | null;
  countryCode: string | null;
  nationality: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  city: string | null;
  bio: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  timezone: string;
  language: string;
};

export const DEMO_ACCOUNTS: readonly DemoAccountDefinition[] = [
  {
    key: "super_admin",
    email: "superadmin@eagerpilots.com",
    role: ROLES.SUPER_ADMIN,
    firstName: "Super",
    lastName: "Admin",
    status: ACCOUNT_STATUS.ACTIVE,
    permanent: true,
    profileComplete: true,
    emailVerified: true,
    phone: "+96550000000",
    countryCode: "KW",
    nationality: "Kuwaiti",
    dateOfBirth: "1985-01-15",
    gender: "male",
    city: "Kuwait City",
    bio: "Platform Super Admin — full system access for operations and client demos.",
    emergencyContactName: "Ops Desk",
    emergencyContactPhone: "+96550000999",
    timezone: "Asia/Kuwait",
    language: "en",
  },
  {
    key: "admin",
    email: "admin@eagerpilots.com",
    role: ROLES.ADMIN,
    firstName: "Amina",
    lastName: "Hassan",
    status: ACCOUNT_STATUS.ACTIVE,
    permanent: true,
    profileComplete: true,
    emailVerified: true,
    phone: "+971501112233",
    countryCode: "AE",
    nationality: "Emirati",
    dateOfBirth: "1990-06-08",
    gender: "female",
    city: "Dubai",
    bio: "Academy administrator for enrollments, moderation, and daily operations.",
    emergencyContactName: null,
    emergencyContactPhone: null,
    timezone: "Asia/Dubai",
    language: "en",
  },
  {
    key: "cgi",
    email: "cgi@eagerpilots.com",
    role: ROLES.CHIEF_GROUND_INSTRUCTOR,
    firstName: "Nadia",
    lastName: "Al Fahad",
    status: ACCOUNT_STATUS.ACTIVE,
    permanent: true,
    profileComplete: true,
    emailVerified: true,
    phone: "+96550011122",
    countryCode: "KW",
    nationality: "Kuwaiti",
    dateOfBirth: "1982-03-22",
    gender: "female",
    city: "Kuwait City",
    bio: "Chief Ground Instructor — ATPL subject distribution, scheduling, and instructor oversight.",
    emergencyContactName: null,
    emergencyContactPhone: null,
    timezone: "Asia/Kuwait",
    language: "en",
  },
  {
    key: "instructor",
    email: "instructor.one@eagerpilots.com",
    role: ROLES.INSTRUCTOR,
    firstName: "Abdulaziz",
    lastName: "Alshoail",
    status: ACCOUNT_STATUS.ACTIVE,
    permanent: true,
    profileComplete: true,
    emailVerified: true,
    phone: "+96550000001",
    countryCode: "KW",
    nationality: "Kuwaiti",
    dateOfBirth: "1979-09-14",
    gender: "male",
    city: "Kuwait City",
    bio: "Captain Abdulaziz Alshoail — lead instructor for ATPL theory and live Zoom sessions.",
    emergencyContactName: null,
    emergencyContactPhone: null,
    timezone: "Asia/Kuwait",
    language: "en",
  },
  {
    key: "instructor_secondary",
    email: "instructor.two@eagerpilots.com",
    role: ROLES.INSTRUCTOR,
    firstName: "Sara",
    lastName: "Al Mansoori",
    status: ACCOUNT_STATUS.ACTIVE,
    permanent: false,
    profileComplete: true,
    emailVerified: true,
    phone: "+971509998877",
    countryCode: "AE",
    nationality: "Emirati",
    dateOfBirth: "1988-12-01",
    gender: "female",
    city: "Abu Dhabi",
    bio: "Secondary instructor for Private Session booking and live workshops.",
    emergencyContactName: null,
    emergencyContactPhone: null,
    timezone: "Asia/Dubai",
    language: "en",
  },
  {
    key: "student",
    email: "student.one@eagerpilots.com",
    role: ROLES.STUDENT,
    firstName: "Omar",
    lastName: "Khalil",
    status: ACCOUNT_STATUS.ACTIVE,
    permanent: true,
    profileComplete: true,
    emailVerified: true,
    phone: "+201001112233",
    countryCode: "EG",
    nationality: "Egyptian",
    dateOfBirth: "1998-04-12",
    gender: "male",
    city: "Cairo",
    bio: "ATPL Program student — enrolled in all theory subjects with sample progress for demos.",
    emergencyContactName: "Hassan Khalil",
    emergencyContactPhone: "+201009998877",
    timezone: "Africa/Cairo",
    language: "en",
  },
  {
    key: "student_secondary",
    email: "student.two@eagerpilots.com",
    role: ROLES.STUDENT,
    firstName: "Layla",
    lastName: "Nasser",
    status: ACCOUNT_STATUS.ACTIVE,
    permanent: false,
    profileComplete: true,
    emailVerified: true,
    phone: "+966501234567",
    countryCode: "SA",
    nationality: "Saudi",
    dateOfBirth: "1999-11-03",
    gender: "female",
    city: "Riyadh",
    bio: "Working through Performance and Mass & Balance modules.",
    emergencyContactName: "Noura Nasser",
    emergencyContactPhone: "+966509876543",
    timezone: "Asia/Riyadh",
    language: "en",
  },
  {
    key: "student_pending",
    email: "student.three@eagerpilots.com",
    role: ROLES.STUDENT,
    firstName: "Noah",
    lastName: "Brooks",
    status: ACCOUNT_STATUS.PENDING,
    permanent: false,
    profileComplete: false,
    emailVerified: true,
    phone: null,
    countryCode: "US",
    nationality: null,
    dateOfBirth: null,
    gender: null,
    city: null,
    bio: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    timezone: "UTC",
    language: "en",
  },
  {
    key: "student_suspended",
    email: "student.four@eagerpilots.com",
    role: ROLES.STUDENT,
    firstName: "Mia",
    lastName: "Chen",
    status: ACCOUNT_STATUS.SUSPENDED,
    permanent: false,
    profileComplete: true,
    emailVerified: true,
    phone: "+447700900123",
    countryCode: "GB",
    nationality: "British",
    dateOfBirth: "1997-07-21",
    gender: "female",
    city: "London",
    bio: null,
    emergencyContactName: null,
    emergencyContactPhone: null,
    timezone: "Europe/London",
    language: "en",
  },
  {
    key: "student_journey",
    email: "abdulaziz@aviatorpass.com",
    role: ROLES.STUDENT,
    firstName: "Abdulaziz",
    lastName: "Alshoail",
    status: ACCOUNT_STATUS.ACTIVE,
    permanent: false,
    profileComplete: true,
    emailVerified: true,
    phone: "+96550012345",
    countryCode: "KW",
    nationality: "Kuwaiti",
    dateOfBirth: "1996-01-18",
    gender: "male",
    city: "Kuwait City",
    bio: "Full ATPL ground school track.",
    emergencyContactName: "Family contact",
    emergencyContactPhone: "+96550098765",
    timezone: "Asia/Kuwait",
    language: "en",
  },
] as const;

export const PRIMARY_DEMO_EMAILS = {
  superAdmin: "superadmin@eagerpilots.com",
  admin: "admin@eagerpilots.com",
  cgi: "cgi@eagerpilots.com",
  instructor: "instructor.one@eagerpilots.com",
  student: "student.one@eagerpilots.com",
} as const;

export function getDemoAccount(key: DemoAccountKey): DemoAccountDefinition {
  const found = DEMO_ACCOUNTS.find((a) => a.key === key);
  if (!found) throw new Error(`Unknown demo account key: ${key}`);
  return found;
}

export function isPermanentDemoEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return DEMO_ACCOUNTS.some((a) => a.permanent && a.email === normalized);
}

export function isDemoAccountEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return DEMO_ACCOUNTS.some((a) => a.email === normalized);
}

export function listDemoAccountPermissions(role: Role): readonly string[] {
  if (role === ROLES.SUPER_ADMIN) return ["*"];
  return getPermissionsForRole(role);
}

export function demoAvatarDataUri(initials: string): string {
  const safe =
    initials
      .replace(/[^A-Z]/gi, "")
      .slice(0, 2)
      .toUpperCase() || "AP";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="#143048"/><text x="64" y="74" text-anchor="middle" font-family="Arial,sans-serif" font-size="44" font-weight="700" fill="#F6C36C">${safe}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
