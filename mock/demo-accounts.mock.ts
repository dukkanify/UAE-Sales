import type { UserProfile } from "@/types";

export const DEMO_OTP = "123456";

export type DemoAccountRole = "user" | "business" | "admin";

export type DemoAccount = {
  email: string;
  label: string;
  password: string;
  phone: string;
  postLoginPath: string;
  profile: UserProfile;
  role: DemoAccountRole;
};

export const demoAccounts: DemoAccount[] = [
  {
    email: "user@sooqna.demo",
    label: "مستخدم فردي",
    password: "User@123",
    phone: "0501234567",
    postLoginPath: "/profile",
    role: "user",
    profile: {
      id: "demo-user-001",
      accountType: "individual",
      city: "دبي",
      email: "user@sooqna.demo",
      favoritesCount: 32,
      fullName: "Ahmed Al Mansoori",
      isVerified: true,
      joinedAt: "2025-03-12",
      listingsCount: 8,
      phone: "0501234567",
      role: "user",
      walletBalance: 18750,
    },
  },
  {
    email: "company@sooqna.demo",
    label: "شركة / أعمال",
    password: "Company@123",
    phone: "0551234567",
    postLoginPath: "/dashboard/listings",
    role: "business",
    profile: {
      id: "demo-business-001",
      accountType: "business",
      city: "أبوظبي",
      email: "company@sooqna.demo",
      employeesCount: 12,
      fullName: "Emirates Motors LLC",
      isVerified: true,
      joinedAt: "2024-06-01",
      listingsCount: 186,
      phone: "0551234567",
      role: "business",
      subscription: "Premium",
      walletBalance: 245000,
    },
  },
  {
    email: "admin@sooqna.demo",
    label: "مدير النظام",
    password: "Admin@123",
    phone: "0521234567",
    postLoginPath: "/admin",
    role: "admin",
    profile: {
      id: "demo-admin-001",
      accountType: "company",
      city: "دبي",
      email: "admin@sooqna.demo",
      fullName: "Sooqna Admin",
      isVerified: true,
      joinedAt: "2024-01-01",
      phone: "0521234567",
      role: "admin",
    },
  },
];

/** Legacy demo emails still accepted */
const LEGACY_EMAIL_MAP: Record<string, string> = {
  "admin@uaesales.demo": "admin@sooqna.demo",
  "company@uaesales.demo": "company@sooqna.demo",
  "user@uaesales.demo": "user@sooqna.demo",
};

function normalizeIdentifier(value: string): string {
  const normalized = value.trim().toLowerCase();
  return LEGACY_EMAIL_MAP[normalized] ?? normalized;
}

function normalizePhone(value: string): string {
  return value.replace(/\s+/g, "").replace(/^\+971/, "0");
}

export function findDemoAccount(
  identifier: string,
  password: string,
): DemoAccount | undefined {
  const normalized = normalizeIdentifier(identifier);
  const phone = normalizePhone(identifier);

  return demoAccounts.find(
    (account) =>
      account.password === password &&
      (normalizeIdentifier(account.email) === normalized ||
        normalizePhone(account.phone) === phone),
  );
}

export function findDemoAccountByIdentifier(
  identifier: string,
): DemoAccount | undefined {
  const normalized = normalizeIdentifier(identifier);
  const phone = normalizePhone(identifier);

  return demoAccounts.find(
    (account) =>
      normalizeIdentifier(account.email) === normalized ||
      normalizePhone(account.phone) === phone,
  );
}
