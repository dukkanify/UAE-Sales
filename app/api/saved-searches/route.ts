import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import {
  getSavedSearchesForUser,
  removeSavedSearchForUser,
  upsertSavedSearch,
} from "@/services/saved-searches/saved-search-store";

const schema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(120),
  url: z.string().min(1).max(400),
  query: z.string().max(80).optional(),
  categoryId: z.string().max(80).optional(),
  city: z.string().max(80).optional(),
});

export async function GET() {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;
  const searches = await getSavedSearchesForUser(user.id);
  return NextResponse.json({ searches });
}

export async function POST(request: Request) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }
  const record = await upsertSavedSearch({
    ...parsed.data,
    userId: user.id,
  });
  return NextResponse.json({ search: record });
}

export async function DELETE(request: Request) {
  const user = await requireSessionUser();
  if (!isSessionUser(user)) return user;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID_REQUIRED" }, { status: 400 });
  await removeSavedSearchForUser(user.id, id);
  return NextResponse.json({ ok: true });
}
