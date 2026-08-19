import { NextResponse } from "next/server";
import { z } from "zod";
import {
  isSessionUser,
  requireSessionUser,
} from "@/services/auth/require-session";
import {
  addSavedSearchForUser,
  getSavedSearchesForUser,
  syncSavedSearchesForUser,
} from "@/services/saved-searches/store";

const filtersSchema = z.object({
  category: z.string().optional(),
  city: z.string().optional(),
  condition: z.string().optional(),
  country: z.string().optional(),
  maxPrice: z.string().optional(),
  minPrice: z.string().optional(),
  query: z.string().optional(),
  sort: z.string().optional(),
});

const searchSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
  query: z.string().optional(),
  filters: filtersSchema.optional(),
  fingerprint: z.string().optional(),
  createdAt: z.string().optional(),
  lastUsedAt: z.string().optional(),
  id: z.string().optional(),
});

const syncSchema = z.object({
  sync: z.literal(true),
  searches: z.array(searchSchema),
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

  const body = await request.json();
  if (body?.sync === true) {
    const parsed = syncSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }
    const searches = await syncSavedSearchesForUser(user.id, parsed.data.searches);
    return NextResponse.json({ searches });
  }

  const parsed = searchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const result = await addSavedSearchForUser(user.id, parsed.data);
  return NextResponse.json({
    search: result.search,
    alreadySaved: result.alreadySaved,
  });
}
