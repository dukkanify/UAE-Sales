import { NextResponse } from "next/server";
import { z } from "zod";
import {
  clearSessionCookie,
  getSessionFromCookie,
  setSessionCookie,
} from "@/services/auth/session-cookie";

const userSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().min(1),
  email: z.string().email(),
  // Registration may create accounts without a phone yet.
  phone: z.string(),
  city: z.string().min(1),
  accountType: z.enum(["buyer", "seller", "business", "individual", "company"]),
  isVerified: z.boolean(),
  joinedAt: z.string().min(1),
  role: z.enum(["user", "business", "admin"]).optional(),
  walletBalance: z.number().optional(),
});

const sessionBodySchema = z.object({
  user: userSchema,
});

export async function GET() {
  const user = await getSessionFromCookie();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = sessionBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    await setSessionCookie(parsed.data.user);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "SESSION_SET_FAILED" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "SESSION_CLEAR_FAILED" }, { status: 500 });
  }
}
