import { NextResponse } from "next/server";
import { z } from "zod";
import { getValidSessionUser } from "@/services/auth/require-session";
import { createOptionSuggestion } from "@/services/admin/option-suggestion-store";
import { checkRateLimit, getClientIp } from "@/services/auth/rate-limit";

const schema = z.object({
  categoryId: z.string().min(1),
  fieldKey: z.string().min(1),
  value: z.string().trim().min(2).max(80),
  listingId: z.string().optional(),
});

/** Authenticated users can submit custom dropdown values for admin approval. */
export async function POST(request: Request) {
  const user = await getValidSessionUser();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const ip = getClientIp(request);
  const allowed = await checkRateLimit(`option-suggest:${user.id}:${ip}`);
  if (!allowed) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const suggestion = await createOptionSuggestion({
    ...parsed.data,
    requestedByUserId: user.id,
    requestedByName: user.fullName,
  });

  return NextResponse.json({ ok: true, suggestion });
}
