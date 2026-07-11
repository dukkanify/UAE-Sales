import { NextResponse } from "next/server";
import { z } from "zod";
import { emailHasActiveAccount } from "@/services/auth/guest-account.service";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const hasAccount = await emailHasActiveAccount(email);

  return NextResponse.json({ ok: true, hasAccount });
}
