import type { AccountType, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { mapDbUser } from "@/lib/mappers";
import { DEMO_OTP } from "@/mock/demo-accounts.mock";

const OTP_TTL_MS = 10 * 60 * 1000;

function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string): string {
  return value.replace(/\s+/g, "").replace(/^\+971/, "0");
}

export async function findUserByIdentifier(identifier: string) {
  const normalized = normalizeIdentifier(identifier);
  const phone = normalizePhone(identifier);

  return prisma.user.findFirst({
    where: {
      OR: [{ email: normalized }, { phone }],
    },
    include: { wallet: true },
  });
}

export async function validateUserCredentials(
  identifier: string,
  password: string,
) {
  const user = await findUserByIdentifier(identifier);
  if (!user) {
    return null;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  return valid ? user : null;
}

export async function createOtpVerification(identifier: string, userId?: string) {
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.otpVerification.create({
    data: {
      identifier: normalizeIdentifier(identifier),
      userId,
      code: DEMO_OTP,
      expiresAt,
    },
  });

  return { otpRequested: true, identifier };
}

export async function verifyOtpCode(identifier: string, code: string) {
  if (code !== DEMO_OTP) {
    return null;
  }

  const record = await prisma.otpVerification.findFirst({
    where: {
      identifier: normalizeIdentifier(identifier),
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.code !== code) {
    return null;
  }

  await prisma.otpVerification.update({
    where: { id: record.id },
    data: { verified: true },
  });

  const user = record.userId
    ? await prisma.user.findUnique({
        where: { id: record.userId },
        include: { wallet: true },
      })
    : await findUserByIdentifier(identifier);

  return user;
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true },
  });

  if (!user) {
    return null;
  }

  return mapDbUser(user, user.wallet?.availableBalance);
}

export function getPostLoginPathForRole(role: UserRole): string {
  if (role === "USER") {
    return "/profile";
  }
  return "/dashboard/listings";
}

export async function registerUser(data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  accountType: AccountType;
  city?: string;
}) {
  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      phone: normalizePhone(data.phone),
      passwordHash,
      accountType: data.accountType,
      role: "USER",
      city: data.city,
      verified: false,
      wallet: {
        create: {
          availableBalance: 0,
          pendingBalance: 0,
        },
      },
    },
    include: { wallet: true },
  });

  return mapDbUser(user, user.wallet?.availableBalance ?? 0);
}

export async function updateUserProfile(
  userId: string,
  payload: {
    fullName?: string;
    phone?: string;
    city?: string;
    emirate?: string;
  },
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: payload,
    include: { wallet: true },
  });

  return mapDbUser(user, user.wallet?.availableBalance);
}
