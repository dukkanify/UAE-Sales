import { NextResponse } from "next/server";
import { z } from "zod";
import { isSessionUser, requireSessionUser } from "@/services/auth/require-session";
import { updateUserOnboarding } from "@/services/auth/user-store";
import { setSessionCookie } from "@/services/auth/session-cookie";

const schema = z.object({
  businessName: z.string().min(2),
  category: z.string().min(1),
  contactPhone: z.string().min(8),
  emirate: z.string().min(1),
  logoUrl: z.string().optional(),
  tradeLicenseNumber: z.string().min(1),
});

export async function POST(request: Request) {
  const sessionUser = await requireSessionUser();
  if (!isSessionUser(sessionUser)) return sessionUser;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const user = await updateUserOnboarding(sessionUser.id, {
    businessName: parsed.data.businessName,
    tradeLicenseNumber: parsed.data.tradeLicenseNumber,
    emirate: parsed.data.emirate,
    category: parsed.data.category,
    contactPhone: parsed.data.contactPhone,
    logoUrl: parsed.data.logoUrl,
  });

  await setSessionCookie(user);
  return NextResponse.json({ ok: true, user });
}
