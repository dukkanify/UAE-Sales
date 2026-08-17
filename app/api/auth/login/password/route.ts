import { NextResponse } from "next/server";
import { z } from "zod";
import { findDemoAccount } from "@/mock/demo-accounts.mock";
import { setSessionCookie } from "@/services/auth/session-cookie";
import { findUserByEmail, toUserProfile, getRedirectAfterAuth, restoreUserWithPasswordProof } from "@/services/auth/user-store";
import { verifyPassword } from "@/services/auth/password.service";
import { readAccountProofCookie } from "@/services/auth/account-vault";
import { getPostLoginPath } from "@/services/auth/auth.service";
import { getSafeNextPath } from "@/shared/utils/safe-next";
import { trackAuthEvent } from "@/services/analytics/auth-events";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  next: z.string().optional(),
  accountProof: z.string().min(20).optional(),
  fullName: z.string().min(1).optional(),
  accountType: z.enum(["buyer", "seller", "business", "individual", "company"]).optional(),
});

function passwordMatches(storedHash: string, password: string): boolean {
  try {
    return verifyPassword(password, storedHash);
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const password = parsed.data.password.trim();

    const demo = findDemoAccount(email, password);
    if (demo) {
      await setSessionCookie(demo.profile);
      trackAuthEvent("login_verified");
      const redirectTo = getSafeNextPath(
        parsed.data.next,
        getPostLoginPath(email, getRedirectAfterAuth(demo.profile)),
      );
      return NextResponse.json({ ok: true, user: demo.profile, redirectTo });
    }

    let stored = await findUserByEmail(email);
    const credentialsMatch = Boolean(
      stored?.passwordHash && passwordMatches(stored.passwordHash, password),
    );
    if (!credentialsMatch) {
      try {
        const cookieProof = await readAccountProofCookie(email);
        const passwordHash = parsed.data.accountProof ?? cookieProof?.passwordHash;
        if (passwordHash) {
          stored =
            (await restoreUserWithPasswordProof({
              email,
              password,
              passwordHash,
              fullName: parsed.data.fullName ?? cookieProof?.fullName,
              accountType: parsed.data.accountType ?? cookieProof?.accountType,
            })) ?? stored;
        }
      } catch {
        // Fall through to invalid-credentials if restore fails.
      }
    }
    if (stored?.passwordHash && passwordMatches(stored.passwordHash, password)) {
      if (stored.accountStatus === "suspended") {
        return NextResponse.json(
          { error: "ACCOUNT_SUSPENDED", message: "تم إيقاف هذا الحساب." },
          { status: 403 },
        );
      }
      if (stored.accountStatus && stored.accountStatus !== "active") {
        return NextResponse.json(
          {
            error: "ACCOUNT_INACTIVE",
            message: "الحساب غير مفعّل بعد. أكمل التحقق من البريد ثم حاول مجدداً.",
          },
          { status: 403 },
        );
      }
      const user = toUserProfile(stored);
      await setSessionCookie(user);
      trackAuthEvent("login_verified");
      const redirectTo = getSafeNextPath(
        parsed.data.next,
        getRedirectAfterAuth(user, parsed.data.next),
      );
      return NextResponse.json({
        ok: true,
        user,
        redirectTo,
        accountProof: stored.passwordHash,
      });
    }

    return NextResponse.json(
      { error: "INVALID_CREDENTIALS", message: "بيانات الدخول غير صحيحة." },
      { status: 401 },
    );
  } catch {
    return NextResponse.json(
      { error: "LOGIN_FAILED", message: "تعذر تسجيل الدخول حاليًا. حاول مرة أخرى." },
      { status: 500 },
    );
  }
}
