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

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const stored = await findUserByEmail(email);

  if (stored?.passwordHash && verifyPassword(parsed.data.password, stored.passwordHash)) {
    const user = toUserProfile(stored);
    await setSessionCookie(user);
    trackAuthEvent("login_verified");
    const redirectTo = getSafeNextPath(
      parsed.data.next,
      getRedirectAfterAuth(user, parsed.data.next),
    );
    return NextResponse.json({ ok: true, user, redirectTo });
  }

  const demo = findDemoAccount(email, parsed.data.password);
  if (demo) {
    await setSessionCookie(demo.profile);
    trackAuthEvent("login_verified");
    const redirectTo = getSafeNextPath(
      parsed.data.next,
      getPostLoginPath(email, getRedirectAfterAuth(demo.profile)),
    );
    return NextResponse.json({ ok: true, user: demo.profile, redirectTo });
  }

  return NextResponse.json(
    { error: "INVALID_CREDENTIALS", message: "بيانات الدخول غير صحيحة." },
    { status: 401 },
  );
}
