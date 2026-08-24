/**
 * Integration: enterprise registration → OTP → atomic account creation.
 */

import { beforeEach, describe, expect, it } from "vitest";

import { ACTIVITY_ACTIONS } from "@/constants/activity-actions";
import {
  finalizeEnterpriseRegistration,
  matchRegistrationOtp,
  resendRegistrationOtp,
  startEnterpriseRegistration,
} from "@/services/auth/registration-service";
import {
  findUserByEmail,
  findUserByPhone,
  readAuthDb,
  writeAuthDb,
  type StoredUser,
} from "@/services/auth/store";
import { registerSchema } from "@/utils/validation";
import type { UserProfile } from "@/types";

function uniqueEmail(prefix: string) {
  return `${prefix}.${Date.now()}.${Math.random().toString(16).slice(2)}@eagerpilots.com`;
}

function uniquePhone() {
  const n = Math.floor(10000000 + Math.random() * 89999999);
  return `+965${n}`;
}

const strongPassword = "Secret12!";

describe("enterprise registration", () => {
  beforeEach(() => {
    // Clean pending + OTP noise between cases without wiping seeded users.
    writeAuthDb((db) => {
      db.pendingRegistrations = [];
      db.otps = db.otps.filter((o) => o.purpose !== "register");
    });
  });

  it("rejects weak passwords and honeypot fills at the schema boundary", () => {
    expect(
      registerSchema.safeParse({
        firstName: "Amira",
        lastName: "Hassan",
        email: "amira@eagerpilots.com",
        phone: "+971501234567",
        countryCode: "AE",
        nationality: "Emirati",
        password: "weak",
        confirmPassword: "weak",
        acceptTerms: true,
        acceptPrivacy: true,
        role: "student",
      }).success,
    ).toBe(false);

    expect(
      registerSchema.safeParse({
        firstName: "Amira",
        lastName: "Hassan",
        email: "amira@eagerpilots.com",
        phone: "+971501234567",
        countryCode: "AE",
        nationality: "Emirati",
        password: strongPassword,
        confirmPassword: strongPassword,
        acceptTerms: true,
        acceptPrivacy: true,
        role: "student",
        website: "http://spam.example",
      }).success,
    ).toBe(false);
  });

  it("starts registration, enforces unique email/phone, and finalizes atomically", async () => {
    const email = uniqueEmail("reg");
    const phone = uniquePhone();
    const payload = registerSchema.parse({
      firstName: "Amira",
      lastName: "Hassan",
      email,
      phone,
      countryCode: "KW",
      nationality: "Kuwaiti",
      password: strongPassword,
      confirmPassword: strongPassword,
      acceptTerms: true,
      acceptPrivacy: true,
      marketingConsent: true,
      role: "student",
    });

    const started = await startEnterpriseRegistration(payload);
    expect(started.success).toBe(true);
    expect(started.data?.email).toBe(email);
    expect(findUserByEmail(email)).toBeNull();

    const restart = await startEnterpriseRegistration({
      ...payload,
      phone: uniquePhone(),
      firstName: "Amira",
    });
    // Same email may restart a pending registration (abandoned signup recovery).
    expect(restart.success).toBe(true);

    const challenge = readAuthDb().otps.find((o) => o.email === email && o.purpose === "register");
    expect(challenge).toBeTruthy();
    expect(challenge!.maxAttempts).toBe(5);

    const pending = readAuthDb().pendingRegistrations.find((p) => p.email === email);
    expect(pending).toBeTruthy();
    expect(challenge!.pendingRegistrationId).toBe(pending!.id);
    const finalPhone = pending!.phone;

    const demoCode = restart.data?.demoOtp ?? "123456";
    expect(matchRegistrationOtp(challenge!.codeHash, demoCode)).toBe(true);

    const issued: StoredUser[] = [];
    const finalized = await finalizeEnterpriseRegistration({
      email,
      challenge: challenge!,
      issueSession: async (user) => {
        issued.push(user);
        const profile = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
          profileComplete: user.profileComplete,
          phone: user.phone,
          countryCode: user.countryCode,
          nationality: user.nationality,
          avatarUrl: user.avatarUrl,
          timezone: user.timezone,
          language: user.language,
        } as UserProfile;
        return { profile, expiresAt: new Date(Date.now() + 3600_000).toISOString() };
      },
    });

    expect(finalized.success).toBe(true);
    expect(issued).toHaveLength(1);
    const user = findUserByEmail(email);
    expect(user).toBeTruthy();
    expect(user!.emailVerified).toBe(true);
    expect(user!.phone).toBe(finalPhone);
    expect(user!.avatarUrl).toMatch(/^data:image\/svg\+xml/);
    expect(findUserByPhone(finalPhone)?.id).toBe(user!.id);

    const db = readAuthDb();
    expect(db.pendingRegistrations.find((p) => p.email === email)).toBeUndefined();
    expect(db.notificationPreferences.some((p) => p.userId === user!.id && p.emailMarketing)).toBe(
      true,
    );
    expect(db.securitySettings.some((s) => s.userId === user!.id)).toBe(true);
    expect(
      db.activityLogs.some(
        (l) => l.action === ACTIVITY_ACTIONS.USER_CREATED && l.entityId === user!.id,
      ),
    ).toBe(true);
    expect(finalized.data?.redirectTo).toMatch(/\/(complete-profile|student\/dashboard)/);
    expect(finalized.data?.requiresProfile).toBe(!user!.profileComplete);

    const emailClash = await startEnterpriseRegistration({
      ...payload,
      email,
      phone: uniquePhone(),
    });
    expect(emailClash.success).toBe(false);
    expect(emailClash.error).toMatch(/email/i);

    const phoneClash = await startEnterpriseRegistration({
      ...payload,
      email: uniqueEmail("other"),
      phone: finalPhone,
    });
    expect(phoneClash.success).toBe(false);
    expect(phoneClash.error).toMatch(/phone/i);
  });

  it("invalidates prior OTP on resend and rejects wrong codes", async () => {
    const email = uniqueEmail("otp");
    const phone = uniquePhone();
    const payload = registerSchema.parse({
      firstName: "Omar",
      lastName: "Saleh",
      email,
      phone,
      countryCode: "AE",
      nationality: "Emirati",
      password: strongPassword,
      confirmPassword: strongPassword,
      acceptTerms: true,
      acceptPrivacy: true,
      role: "student",
    });

    const started = await startEnterpriseRegistration(payload);
    expect(started.success).toBe(true);
    const first = readAuthDb().otps.find((o) => o.email === email && o.purpose === "register")!;
    const firstId = first.id;

    // Force resend cooldown to expire
    writeAuthDb((db) => {
      const o = db.otps.find((x) => x.id === firstId);
      if (o) o.resendAvailableAt = new Date(Date.now() - 1000).toISOString();
    });

    const resent = await resendRegistrationOtp(email);
    expect(resent.success).toBe(true);
    const second = readAuthDb().otps.find((o) => o.email === email && o.purpose === "register")!;
    expect(second.id).not.toBe(firstId);
    expect(
      readAuthDb().otps.filter((o) => o.email === email && o.purpose === "register"),
    ).toHaveLength(1);

    expect(matchRegistrationOtp(second.codeHash, "000000")).toBe(false);
  });
});
