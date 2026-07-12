import { NextResponse } from "next/server";
import { z } from "zod";
import { findDemoAccount } from "@/mock/demo-accounts.mock";
import { setSessionCookie } from "@/services/auth/session-cookie";
import { findUserByEmail, toUserProfile, getRedirectAfterAuth } from "@/services/auth/user-store";
import { verifyPassword } from "@/services/auth/password.service";
import { getPostLoginPath } from "@/services/auth/auth.service";
import { getSafeNextPath } from "@/shared/utils/safe-next";
import { trackAuthEvent } from "@/services/analytics/auth-events";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  next: z.string().optional(),
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
    const password = parsed.data.password;

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

    const stored = await findUserByEmail(email);
    if (stored?.passwordHash && passwordMatches(stored.passwordHash, password)) {
      const user = toUserProfile(stored);
      await setSessionCookie(user);
      trackAuthEvent("login_verified");
      const redirectTo = getSafeNextPath(
        parsed.data.next,
        getRedirectAfterAuth(user, parsed.data.next),
      );
      return NextResponse.json({ ok: true, user, redirectTo });
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
